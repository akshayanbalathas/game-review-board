const SignupPage = {
    name: 'SignupPage',
    template: `
    <div>
      <div class="page-header">
        <div class="container">
          <h1>Create <span>Account</span></h1>
        </div>
      </div>

      <div class="container" style="max-width: 520px; padding: 1rem 1.5rem 4rem;">
        <div class="card">
        
          <div class="card-heading">
          
            <i class="fas fa-user-plus" style="color: var(--accent);"></i>
            Signup
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
              maxlength="50"
            />

            <input
              v-model="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              maxlength="50"
            />

            <button class="btn submit-btn w-100" @click="signup">
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
    setup() {
        const username = Vue.ref('');

        const password = Vue.ref('');

        const confirmPassword = Vue.ref('')

        const errorMsg = Vue.ref('');

        function signup() {
            const cleanUsername = username.value.trim();

            if (!cleanUsername || !password.value || !confirmPassword.value) {
                errorMsg.value = 'Please fill in all fields.';
                return;
            }

            if (password.value !== confirmPassword.value) {
                errorMsg.value = 'Passwords do not match.';
                return;
            }

            let users = JSON.parse(localStorage.getItem('users')) || [];

            const userExists = users.some(
                user => user.username.toLowerCase() === cleanUsername.toLowerCase()
            );

            if (userExists) {
                errorMsg.value = 'Username already exists.';
                return;
            }

            const newUser = {
                username: cleanUsername,
                password: password.value
            };

            users.push(newUser);

            localStorage.setItem('users', JSON.stringify(users));

            localStorage.setItem('loggedIn', 'true');

            localStorage.setItem('currentUser', cleanUsername);

            errorMsg.value = '';
            router.push('/');
            location.reload();
        }

        return { username, password, confirmPassword, errorMsg, signup };
    }
};