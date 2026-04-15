const { createRouter, createWebHashHistory } = VueRouter;

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/',           component: HomePage },
    { path: '/reviews',    component: AllReviewsPage },
    { path: '/stats',      component: StatsPage },
    { path: '/game/:id',   component: GamePage },
    { path: '/favourites', component: FavouritesPage }
  ]
});