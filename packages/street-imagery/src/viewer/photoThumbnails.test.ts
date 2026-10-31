import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import { fetchMapilioFullUrl, fetchMapilioSequenceItem } from './photoThumbnails'

const sequenceResponse = () =>
  Response.json({
    data: [
      { id: 1, filename: 'a.jpg', uploaded_hash: 'hash-a' },
      { id: 2, filename: 'b.jpg', uploaded_hash: 'hash-b' },
    ],
  })

describe('Mapilio sequence detail', () => {
  let originalFetch: typeof fetch

  beforeEach(() => {
    originalFetch = globalThis.fetch
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('requests a sequence once for all of its photos', async () => {
    const fetchMock = mock(() => Promise.resolve(sequenceResponse()))
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const urls = await Promise.all([
      fetchMapilioFullUrl('sequence-once', '1'),
      fetchMapilioFullUrl('sequence-once', '2'),
    ])

    expect(urls).toEqual([
      'https://cdn.mapilio.com/im/hash-a/a.jpg/2080',
      'https://cdn.mapilio.com/im/hash-b/b.jpg/2080',
    ])
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('requests a failed sequence again', async () => {
    const fetchMock = mock(() => Promise.resolve(new Response('', { status: 429 })))
    globalThis.fetch = fetchMock as unknown as typeof fetch

    await expect(fetchMapilioSequenceItem('sequence-retry', '1')).rejects.toThrow('429')

    fetchMock.mockImplementation(() => Promise.resolve(sequenceResponse()))

    expect(await fetchMapilioSequenceItem('sequence-retry', '1')).toMatchObject({ id: 1 })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
