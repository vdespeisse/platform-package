import { createRouter, createWebHistory } from 'vue-router';

export function initRouter(routes) {
  const history = createWebHistory();
  return createRouter({
      strict: true,
      history,
      routes
  })
}

// TODO not sure we want this logic in the package layer, maybe expect the consumer to provide a well formed routeConfig array ?
// TODO this does not work for nested routes like screens/foo/bar.vue
export function parseRouteGlob(routeGlob) {
  return Object.entries(routeGlob).map(([rawPath, component]) => {
    const path = '/' + rawPath.split('/').slice(-1)[0].split('.vue')[0].replace('slash', '')
    return { path, component }
  })
}
