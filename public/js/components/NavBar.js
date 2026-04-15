const NavBar = {
  name: 'NavBar',
  props: ['isLoggedIn'],
  emits: ['logout'],
  template: `
    <nav class="navbar">
      <div class="nav-left">
        <router-link class="nav-brand" to="/">
          <div class="nav-logo">
            <svg viewBox="0 0 18 18" fill="none">
              <rect x="1" y="7" width="16" height="2" rx="1" fill="#080c14"/>
              <rect x="7" y="1" width="2" height="16" rx="1" fill="#080c14"/>
              <circle cx="14" cy="4" r="2" fill="#080c14"/>
              <circle cx="4" cy="14" r="2" fill="#080c14"/>
            </svg>
          </div>
          Game Review Board
        </router-link>
        <ul class="nav-links">
          <li><router-link to="/"><i class="fas fa-home"></i> Home</router-link></li>
          <li><router-link to="/reviews"><i class="fas fa-comments"></i> All Reviews</router-link></li>
          <li><router-link to="/stats"><i class="fas fa-chart-bar"></i> Stats</router-link></li>
        </ul>
      </div>
      <ul class="nav-auth">
        <li v-if="!isLoggedIn"><router-link to="/login"><i class="fas fa-sign-in-alt"></i> Login</router-link></li>
        <li v-if="!isLoggedIn"><router-link to="/signup"><i class="fas fa-user-plus"></i> Signup</router-link></li>
        <li v-if="isLoggedIn">
          <a href="#" @click.prevent="$emit('logout')">
            <i class="fas fa-sign-out-alt"></i> Logout
          </a>
        </li>
      </ul>
    </nav>
  `
};