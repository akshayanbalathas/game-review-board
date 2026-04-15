const HomePage = {
  name: 'HomePage',
  template: `
    <div>
      <section class="hero">
        <div class="container">
          <h1>Discover &amp; Review<br><span>Great Games</span></h1>
          <p>Community-powered reviews for every platform.</p>
        </div>
      </section>

      <div class="container">
        <div class="controls">
          <div class="search-wrap">
            <i class="fas fa-search"></i>
            <input class="search-input" type="text" v-model="searchQuery"
              placeholder="Search games..." @input="debouncedSearch" />
          </div>
          <div class="filter-row">
            <select class="filter-select" v-model="sortBy" @change="loadGames">
              <option value="">Sort: Recent</option>
              <option value="rating">Sort: Highest Rated</option>
              <option value="metacritic">Sort: Metacritic</option>
              <option value="name">Sort: A–Z</option>
            </select>
            <button class="filter-chip" :class="{ active: selectedGenre === '' }"
              @click="selectedGenre = ''; loadGames()">All</button>
            <button v-for="genre in genres" :key="genre" class="filter-chip"
              :class="{ active: selectedGenre === genre }"
              @click="selectedGenre = genre; loadGames()">{{ genre }}</button>
            <span class="count-badge ms-auto" v-if="!loading">{{ games.length }} games</span>
          </div>
        </div>
      </div>

      <div class="container">
        <div class="game-grid">
          <div class="state-box" v-if="loading">
            <div class="spinner"></div><p>Loading games...</p>
          </div>
          <div class="state-box" v-else-if="games.length === 0">
            <i class="fas fa-search"></i><p>No games found.</p>
          </div>
          <div v-else v-for="game in games" :key="game.id"
            class="game-card" @click="$router.push('/game/' + game.id)">
            <img v-if="game.background_image" class="card-img"
              :src="game.background_image" :alt="game.name" loading="lazy"/>
            <div v-else class="card-img-placeholder"><i class="fas fa-gamepad"></i></div>
            <div class="card-body">
              <p class="card-title">{{ game.name }}</p>
              <div class="card-meta">
                <span>{{ formatDate(game.released) }}</span>
                <span class="card-rating" v-if="game.rating">
                  <i class="fas fa-star" style="font-size:0.7rem"></i> {{ game.rating.toFixed(1) }}
                </span>
              </div>
              <div class="card-genres" v-if="game.genres">
                <span v-for="g in game.genres.split(',').slice(0,3)" :key="g"
                  class="genre-tag badge">{{ g.trim() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  setup() {
    const { ref, onMounted } = Vue;
    const API = 'http://localhost:3000';
    const games = ref([]);
    const genres = ref([]);
    const loading = ref(true);
    const searchQuery = ref('');
    const selectedGenre = ref('');
    const sortBy = ref('');
    let debounceTimer = null;

    async function loadGames() {
      loading.value = true;
      try {
        const params = new URLSearchParams();
        if (searchQuery.value) params.set('search', searchQuery.value);
        if (selectedGenre.value) params.set('genre', selectedGenre.value);
        if (sortBy.value) params.set('sort', sortBy.value);
        params.set('limit', '500');
        const res = await fetch(`${API}/games?${params}`);
        games.value = await res.json();
      } catch (e) { games.value = []; }
      finally { loading.value = false; }
    }

    async function loadGenres() {
      try {
        const res = await fetch(`${API}/genres`);
        const data = await res.json();
        genres.value = data.slice(0, 10);
      } catch (e) {}
    }

    function debouncedSearch() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(loadGames, 300);
    }

    function formatDate(d) {
      if (!d) return 'TBA';
      return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    }

    onMounted(() => { loadGenres(); loadGames(); });

    return { games, genres, loading, searchQuery, selectedGenre, sortBy, loadGames, debouncedSearch, formatDate };
  }
};