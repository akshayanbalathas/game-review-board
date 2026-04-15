const { createApp, ref } = Vue;

const app = createApp({
  template: `
    <div>
      <NavBar :isLoggedIn="isLoggedIn" @logout="logout" />
      <router-view></router-view>
      <footer>
        <div class="container">
          <p>Game Review Board — CSCI 3230 Group Project 2026</p>
        </div>
      </footer>
    </div>
  `,
  setup() {
    const isLoggedIn = ref(localStorage.getItem('loggedIn') === 'true');
    function logout() {
      localStorage.removeItem('loggedIn');
      isLoggedIn.value = false;
      router.push('/');
    }
    return { isLoggedIn, logout };
  }
});

app.component('NavBar', NavBar);
app.component('HomePage', HomePage);
app.component('GamePage', GamePage);
app.component('AllReviewsPage', AllReviewsPage);
app.component('StatsPage', StatsPage);

app.use(router);
app.mount('#app');