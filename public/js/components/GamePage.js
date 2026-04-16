const GamePage = {
  name: 'GamePage',
  template: `
    <div>
      <div class="game-hero" v-if="game">
        <img v-if="game.background_image" :src="game.background_image" :alt="game.name" class="hero-img" />
        <div v-else class="hero-placeholder"><i class="fas fa-gamepad"></i></div>
        <div class="hero-overlay">
          <div class="container">
            <h1 class="hero-title">{{ game.name }}</h1>
            <div class="hero-meta d-flex flex-wrap gap-2 align-items-center">
              <span class="meta-pill badge" v-if="game.released">
                <i class="fas fa-calendar"></i> {{ formatDate(game.released) }}
              </span>
              <span class="star-score badge" v-if="game.rating">★ {{ game.rating.toFixed(1) }} / 5</span>
              <span class="mc-badge badge" v-if="game.metacritic">MC {{ game.metacritic }}</span>
              <template v-if="game.genres">
                <span v-for="g in game.genres.split(',').slice(0,4)" :key="g" class="genre-tag badge">{{ g.trim() }}</span>
              </template>
            </div>
            <div class="mt-3">
              <button
                  v-if="!isFavourited"
                  class="btn submit-btn"
                  @click="addFavourite"
              >
                <i class="fas fa-heart"></i> Add to Favourites
              </button>
              <button
                v-else
                class="btn btn-danger"
                @click="removeFavourite"
              >
                <i class="fas fa-heart-broken"></i> Remove from Favourites
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="gameLoading" class="d-flex align-items-center justify-content-center" style="height:200px; color:var(--muted);">
        <div class="spinner"></div>
      </div>

      <div class="container">
        <div class="page-body row g-4">

          <div class="col-12 col-lg-4">
            <div class="card mb-4" v-if="reviews.length > 0">
              <div class="card-heading"><i class="fas fa-star" style="color:var(--accent)"></i> Community Score</div>
              <div class="avg-bar">
                <span class="avg-num">{{ avgRating }}</span>
                <div>
                  <div class="avg-stars">{{ starString(Math.round(avgRatingNum)) }}</div>
                  <div class="avg-label">{{ reviews.length }} review{{ reviews.length !== 1 ? 's' : '' }}</div>
                </div>
              </div>
            </div>

            <div class="card">
              <div class="card-heading"><i class="fas fa-pen" style="color:var(--accent)"></i> Write a Review</div>
              <div v-if="submitSuccess" class="alert alert-success py-2 mb-3" role="alert">
                <i class="fas fa-check-circle"></i> Review posted!
              </div>
              <div v-if="submitError" class="alert alert-danger py-2 mb-3" role="alert">{{ submitError }}</div>
              <div class="form">
                <input v-model="form.username" type="text" class="form-control mb-2" placeholder="Your name" maxlength="50" />
                <div class="mb-2">
                  <p style="font-size:0.85rem; color:var(--muted); margin-bottom:0.5rem;">Your rating</p>
                  <div class="star-picker">
                    <button
                      v-for="n in 5" :key="n"
                      class="star-btn"
                      :class="{ active: n <= form.rating }"
                      @click="form.rating = n"
                      type="button"
                    >★</button>
                  </div>
                </div>
                <textarea v-model="form.comment" rows="4" class="form-control mb-2" placeholder="Share your thoughts on this game..." maxlength="1000"></textarea>
                <button class="btn submit-btn w-100" :disabled="submitting" @click="submitReview">
                  <span v-if="submitting"><i class="fas fa-spinner fa-spin"></i> Posting...</span>
                  <span v-else>Post Review</span>
                </button>
              </div>
            </div>
          </div>

          <div class="col-12 col-lg-8">
            <div class="card">
              <div class="card-heading"><i class="fas fa-comments" style="color:var(--accent2)"></i> Community Reviews</div>
              <div v-if="reviewsLoading" class="empty-state">
                <div class="spinner"></div>
              </div>
              <div v-else-if="reviews.length === 0" class="empty-state">
                <i class="fas fa-comment-slash"></i>
                <p>No reviews yet — be the first!</p>
              </div>
              <div v-else class="review-list">
                <div v-for="review in reviews" :key="review.id" class="review-item">
                  <div class="review-header">
                    <span class="review-author">{{ review.username }}</span>
                    <span class="review-stars">{{ starString(review.rating) }}</span>
                  </div>
                  <p class="review-date">{{ formatDateTime(review.created_at) }}</p>
                  <p class="review-comment">{{ review.comment }}</p>
                  <button class="btn btn-sm delete-btn" @click="deleteReview(review.id)">🗑 Delete</button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  setup() {
    const { ref, computed, onMounted } = Vue;
    const API = 'http://localhost:3000';

    const route = VueRouter.useRoute();
    const gameId = route.params.id;

    const game = ref(null);
    const reviews = ref([]);
    const gameLoading = ref(true);
    const reviewsLoading = ref(true);
    const submitting = ref(false);
    const submitSuccess = ref(false);
    const submitError = ref('');
    const isFavourited = ref(false);

    const form = ref({ username: '', rating: 0, comment: '' });

    const avgRatingNum = computed(() => {
      if (!reviews.value.length) return 0;
      return reviews.value.reduce((a, r) => a + r.rating, 0) / reviews.value.length;
    });

    const avgRating = computed(() => avgRatingNum.value ? avgRatingNum.value.toFixed(1) : '—');

    function starString(n) {
      return '★'.repeat(n) + '☆'.repeat(5 - n);
    }

    function formatDate(d) {
      if (!d) return '';
      return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    function formatDateTime(d) {
      if (!d) return '';
      return new Date(d.replace(' ', 'T')).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    async function loadGame() {
      if (!gameId) { gameLoading.value = false; return; }
      try {
        const res = await fetch(`${API}/games/${gameId}`);
        game.value = await res.json();
        document.title = `${game.value.name} — Game Review Board`;
        await checkFavourite();
      } catch (e) {
        console.error(e);
      } finally {
        gameLoading.value = false;
      }
    }

    async function loadReviews() {
      if (!gameId) return;
      reviewsLoading.value = true;
      try {
        const res = await fetch(`${API}/games/${gameId}/reviews`);
        reviews.value = await res.json();
      } catch (e) {
        console.error(e);
      } finally {
        reviewsLoading.value = false;
      }
    }

    async function checkFavourite() {
      if (!gameId) return;
      try {
        const res = await fetch(`${API}/favourites/${gameId}`);
        const data = await res.json();
        isFavourited.value = data.favourited;
      } catch (e) {
        console.error(e);
      }
    }

    async function addFavourite() {
      if (!game.value) return;
      try {
        const res = await fetch(`${API}/favourites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            game_id: parseInt(gameId),
            game_name: game.value.name,
            game_image: game.value.background_image
          })
        });

        if (!res.ok) throw new Error('Failed to add favourite');
        isFavourited.value = true;
      } catch (e) {
        alert('Failed to add favourite.');
      }
    }
    async function removeFavourite() {
      try {
        const res = await fetch(`${API}/favourites/${gameId}`, {
          method: 'DELETE'
        });

        if (!res.ok) throw new Error('Failed to remove favourite');
        isFavourited.value = false;
      } catch (e) {
        alert('Failed to remove favourite.');
      }
    }

    async function submitReview() {
      submitError.value = '';
      submitSuccess.value = false;

      if (!form.value.username.trim()) return submitError.value = 'Please enter your name.';
      if (!form.value.rating) return submitError.value = 'Please select a star rating.';
      if (!form.value.comment.trim()) return submitError.value = 'Please write a comment.';

      submitting.value = true;
      try {
        const res = await fetch(`${API}/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            game_id: parseInt(gameId),
            username: form.value.username.trim(),
            rating: form.value.rating,
            comment: form.value.comment.trim()
          })
        });
        if (!res.ok) throw new Error('Server error');
        form.value = { username: '', rating: 0, comment: '' };
        submitSuccess.value = true;
        setTimeout(() => submitSuccess.value = false, 3000);
        await loadReviews();
      } catch (e) {
        submitError.value = 'Failed to post review. Please try again.';
      } finally {
        submitting.value = false;
      }
    }

    async function deleteReview(id) {
      if (!confirm('Delete this review?')) return;
      try {
        await fetch(`${API}/reviews/${id}`, { method: 'DELETE' });
        await loadReviews();
      } catch (e) {
        alert('Failed to delete.');
      }
    }

    onMounted(() => {
      loadGame();
      loadReviews();
      
      if (window.io) {
        const socket = window.io(API);
        socket.on("reviews_updated", () => {
          console.log("Live review update broadcast received! Refreshing game comments.");
          loadReviews();
        });
      }
    });

    return {
      game, reviews, gameLoading, reviewsLoading,
      form, submitting, submitSuccess, submitError,
      isFavourited,
      avgRating, avgRatingNum, starString, formatDate,
      formatDateTime, submitReview, deleteReview,
      addFavourite, removeFavourite
    };
  }
};