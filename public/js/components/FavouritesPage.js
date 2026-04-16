const API = 'http://localhost:3000';

const FavouritesPage = {
  data() {
    return {
      favourites: [],
      loading: true,
      error: null
    };
  },

  async mounted() {
    document.title = 'Game Review Board';
    await this.loadFavourites();
  },

  methods: {
    async loadFavourites() {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(`${API}/favourites`);
        if (!response.ok) {
          throw new Error("Failed to load favourites");
        }

        this.favourites = await response.json();
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    async removeFavourite(gameId) {
      try {
        const response = await fetch(`${API}/favourites/${gameId}`, {
          method: "DELETE"
        });

        if (!response.ok) {
          throw new Error("Failed to remove favourite");
        }

        this.favourites = this.favourites.filter(
          (game) => game.game_id !== gameId
        );
      } catch (err) {
        alert(err.message);
      }
    }
  },

  template: `
    <div class="container mt-4">
      <h2 class="mb-4">My Favourites</h2>

      <div v-if="loading" class="text-center">
        <p>Loading favourites...</p>
      </div>

      <div v-else-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <div v-else-if="favourites.length === 0" class="alert alert-info">
        No favourite games yet.
      </div>

      <div v-else class="row">
        <div
          class="col-md-4 col-lg-3 mb-4"
          v-for="game in favourites"
          :key="game.game_id"
        >
          <div class="card h-100 shadow-sm">
            <img
              v-if="game.game_image"
              :src="game.game_image"
              class="card-img-top"
              :alt="game.game_name"
              style="height: 300px; object-fit: cover;"
            />

            <div class="card-body d-flex flex-column">
              <h5 class="card-title">{{ game.game_name }}</h5>

              <div class="mt-auto d-flex gap-2">
                <a
                  :href="'#/game/' + game.game_id"
                  class="btn btn-primary btn-sm me-2"
                >
                  View
                </a>

                <button
                  class="btn btn-outline-danger btn-sm"
                  @click="removeFavourite(game.game_id)"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
};