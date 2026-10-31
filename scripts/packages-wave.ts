/**
 * Shared helpers for the package changeset + release scripts.
 */

import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export const ROOT = join(import.meta.dirname, '..')

export const WAVE_PACKAGES = [
  '@osm-editor-kit/street-imagery',
  '@osm-editor-kit/street-imagery-react',
] as const

export type WavePackage = (typeof WAVE_PACKAGES)[number]

export const DIR_BY_NAME: Record<WavePackage, string> = {
  '@osm-editor-kit/street-imagery': 'packages/street-imagery',
  '@osm-editor-kit/street-imagery-react': 'packages/street-imagery-react',
}

export function isWavePackage(name: string): name is WavePackage {
  return (WAVE_PACKAGES as readonly string[]).includes(name)
}

export function gitCapture(
  args: string[],
  cwd = ROOT,
): { status: number; stdout: string; stderr: string } {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' })
  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  }
}

/**
 * Unpushed commits that are not released yet: @{upstream}..HEAD (fallback origin/main..HEAD),
 * starting after the latest version commit in that range. `changeset version` records the
 * changesets it consumed in pre.json, so a commit that changes pre.json marks everything up to
 * it as released — including its own package.json bumps.
 */
export function defaultGitRange(): string {
  const upstream = gitCapture(['rev-parse', '--abbrev-ref', '@{upstream}'])
  const base = upstream.status === 0 && upstream.stdout.trim() ? '@{upstream}' : 'origin/main'
  const versionCommit = gitCapture([
    'log',
    '-1',
    '--format=%H',
    `${base}..HEAD`,
    '--',
    '.changeset/pre.json',
  ]).stdout.trim()
  return `${versionCommit || base}..HEAD`
}

function shouldIgnoreTouchedPath(path: string): boolean {
  if (path.endsWith('CHANGELOG.md')) return true
  if (path.includes('/dist/')) return true
  return false
}

export function wavePackageForPath(path: string): WavePackage | null {
  for (const name of WAVE_PACKAGES) {
    const dir = DIR_BY_NAME[name]
    if (path === dir || path.startsWith(`${dir}/`)) {
      if (shouldIgnoreTouchedPath(path)) return null
      return name
    }
  }
  return null
}

/**
 * Narrows `range` for one package: a commit that changes the package's `version` field released
 * it, also when it was versioned and published by hand outside `changeset version`.
 */
export function packageReleaseRange(name: WavePackage, range = defaultGitRange()): string {
  const releaseCommit = gitCapture([
    'log',
    '-1',
    '--format=%H',
    '-G',
    '"version":',
    range,
    '--',
    `${DIR_BY_NAME[name]}/package.json`,
  ]).stdout.trim()
  return releaseCommit ? `${releaseCommit}..HEAD` : range
}

export function wavePackagesTouchedInDiff(range = defaultGitRange()): WavePackage[] {
  return WAVE_PACKAGES.filter((name) => {
    const result = gitCapture([
      'diff',
      '--name-only',
      packageReleaseRange(name, range),
      '--',
      DIR_BY_NAME[name],
    ])
    // Empty range (no commits) is fine
    if (result.status !== 0) return false
    return result.stdout.split('\n').some((line) => {
      const path = line.trim()
      return path !== '' && wavePackageForPath(path) === name
    })
  })
}

export type CommitNote = { subject: string; body: string }

/** Commits in range that touch the package directory. */
export function commitsTouchingPackage(dir: string, range = defaultGitRange()): CommitNote[] {
  const result = gitCapture(['log', range, '--format=%s%x00%b%x00%x1e', '--', dir])
  if (result.status !== 0 || !result.stdout.trim()) return []
  const notes: CommitNote[] = []
  for (const chunk of result.stdout.split('\x1e')) {
    const trimmed = chunk.trim()
    if (!trimmed) continue
    const [subject = '', body = ''] = trimmed.split('\x00')
    notes.push({ subject: subject.trim(), body: body.trim() })
  }
  return notes
}

export function pendingChangesetFiles(): string[] {
  const prePath = join(ROOT, '.changeset', 'pre.json')
  const applied = new Set<string>()
  if (existsSync(prePath)) {
    const pre = JSON.parse(readFileSync(prePath, 'utf8')) as { changesets?: string[] }
    for (const id of pre.changesets ?? []) applied.add(id)
  }
  return readdirSync(join(ROOT, '.changeset')).filter((name) => {
    if (!name.endsWith('.md') || name === 'README.md') return false
    const id = name.replace(/\.md$/, '')
    return !applied.has(id)
  })
}

export function packagesMentionedInPendingChangesets(): Set<WavePackage> {
  const mentioned = new Set<WavePackage>()
  for (const file of pendingChangesetFiles()) {
    const body = readFileSync(join(ROOT, '.changeset', file), 'utf8')
    for (const name of WAVE_PACKAGES) {
      if (body.includes(`"${name}"`)) mentioned.add(name)
    }
  }
  return mentioned
}

export function uncoveredWavePackages(range = defaultGitRange()): WavePackage[] {
  const touched = wavePackagesTouchedInDiff(range)
  const mentioned = packagesMentionedInPendingChangesets()
  return touched.filter((name) => !mentioned.has(name))
}

export function shortPackageName(name: WavePackage): string {
  return name.replace('@osm-editor-kit/', '')
}
