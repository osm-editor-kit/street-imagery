import { QueryClient } from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'
import { routerSearch } from '@/app/routerSearch'
import { routeTree } from '@/routeTree.gen'

// Vite `base` (`/street-imagery/` on GitHub Pages) becomes the router basepath.
const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
    },
  },
})

export const getRouter = () => {
  const router = createRouter({
    routeTree,
    context: { queryClient },
    basepath: BASE_PATH,
    trailingSlash: 'never',
    parseSearch: routerSearch.parse,
    stringifySearch: routerSearch.stringify,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  })
  return router
}

export const router = getRouter()

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
