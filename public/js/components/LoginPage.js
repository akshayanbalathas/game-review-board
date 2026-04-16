const LoginPage = {
    name: 'LoginPage',
    template: `
    <div>
      <div class="page-header">
        <div class="container">
          <h1>Account <span>Login</span></h1>
        </div>
      </div>

      <div class="container" style="max-width: 520px">
        <div class="card">
          <div class="card-heading">
            <i class="fas fa-sign-in-alt" style="color: var(--accent);"></i>
            Login
          </div>

          <div v-if="errorMsg" class="error-msg mb-3">{{ errorMsg }}</div>

          <div class="form">
            <input
              v-model="username"
              type="text"
              placeholder="Username"
              maxlength="30"
            />

            <input
              v-model="password"
              type="password"
              placeholder="Password"
              maxlength="15"
            />

            <button class="btn submit-btn w-100" @click="login">
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
    setup() {
        const username = Vue.ref('');

        const password = Vue.ref('');

        const errorMsg = Vue.ref('');

        function login() {
            const cleanUsername = username.value.trim();
            const users = JSON.parse(localStorage.getItem('users')) || [];

            if (!cleanUsername || !password.value) {
                errorMsg.value = 'Please enter your username and password.';
                return;
            }

            const foundUser = users.find(
                user =>
                    user.username.toLowerCase() === cleanUsername.toLowerCase() &&
                    user.password === password.value
            );

            if (!foundUser) {
                errorMsg.value = 'Invalid username or password.';
                return;
            }

            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('currentUser', foundUser.username);

            errorMsg.value = '';
            router.push('/');
            location.reload();
        }

        return { username, password, errorMsg, login };
    }
};