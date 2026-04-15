const AllReviewsPage = {
  name: 'AllReviewsPage',
  template: `
    <div>
      <div class="page-header">
        <div class="container">
          <h1>All <span>Reviews</span></h1>
          <p>What the community is saying</p>
        </div>
      </div>

      <div class="container">
        <div class="all-reviews-body">
          <div class="filter-bar d-flex flex-wrap align-items-center gap-2">
            <div class="flex-grow-1">
              <input v-model="search" type="text" class="form-control"
                placeholder="Search reviews or games..." />
            </div>
            <div style="min-width: 200px;">
              <select v-model="filterRating" class="form-select">
                <option value="">All Ratings</option>
                <option value="5">★★★★★ Only</option>
                <option value="4">★★★★ & up</option>
                <option value="3">★★★ & up</option>
              </select>
            </div>
            <span class="count-badge ms-auto" v-if="!loading">
              {{ filtered.length }} review{{ filtered.length !== 1 ? 's' : '' }}
            </span>
          </div>

          <div v-if="loading" class="text-center py-5">
            <div class="spinner"></div>
          </div>

          <div v-else-if="filtered.length === 0" class="empty-state">
            <i class="fas fa-comment-slash"></i>
            <p>{{ reviews.length === 0 ? 'No reviews yet. Go play something and share your thoughts!' : 'No reviews match your search.' }}</p>
          </div>

          <div v-else class="row g-3 mt-1">
            <div
              v-for="review in filtered"
              :key="review.id"
              class="col-12 col-sm-6 col-lg-3"
              @click="goToGame(review.game_id)"
            >
              <div class="review-card h-100">
                <div class="review-card-top" v-if="review.game_image">
                  <img :src="review.game_image" class="review-img" :alt="review.game_name" />
                  <div class="game-name-badge">{{ review.game_name || 'Unknown Game' }}</div>
                </div>
                <div class="no-image-band" v-else>{{ review.game_name || 'Unknown Game' }}</div>
                <div class="review-card-body">
                  <div class="review-header">
                    <span class="review-author">{{ review.username }}</span>
                    <span class="review-stars">{{ starString(review.rating) }}</span>
                  </div>
                  <p class="review-date">{{ formatDate(review.created_at) }}</p>
                  <p class="review-comment">{{ review.comment }}</p>
                  <button class="btn btn-sm delete-btn mt-2" @click.stop="deleteReview(review.id)">🗑 Delete</button>
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

    const reviews = ref([]);
    const loading = ref(true);
    const search = ref('');
    const filterRating = ref('');

    const filtered = computed(() => {
      return reviews.value.filter(r => {
        const matchSearch = !search.value ||
          r.username.toLowerCase().includes(search.value.toLowerCase()) ||
          (r.game_name || '').toLowerCase().includes(search.value.toLowerCase()) ||
          r.comment.toLowerCase().includes(search.value.toLowerCase());
        const matchRating = !filterRating.value || r.rating >= parseInt(filterRating.value);
        return matchSearch && matchRating;
      });
    });

    function starString(n) {
      return '★'.repeat(n) + '☆'.repeat(5 - n);
    }

    function formatDate(d) {
      if (!d) return '';
      return new Date(d.replace(' ', 'T')).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    }

    function goToGame(id) {
      router.push('/game/' + id);
    }

    async function loadReviews() {
      try {
        const res = await fetch(`${API}/reviews`);
        reviews.value = await res.json();
      } catch (e) {
        console.error(e);
      } finally {
        loading.value = false;
      }
    }

    async function deleteReview(id) {
      if (!confirm('Delete this review?')) return;
      try {
        await fetch(`${API}/reviews/${id}`, { method: 'DELETE' });
        reviews.value = reviews.value.filter(r => r.id !== id);
      } catch (e) {
        alert('Failed to delete.');
      }
    }

    onMounted(loadReviews);

    return {
      reviews, loading, search, filterRating,
      filtered, starString, formatDate, goToGame, deleteReview
    };
  }
};