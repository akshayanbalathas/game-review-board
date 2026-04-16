const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function drawChart(id, drawFn, data) {
  if (!data || data.length === 0) {
    d3.select(`#${id}`).html('<div class="empty-chart">No data available</div>');
    return;
  }
  drawFn(id, data);
}

function drawYearChart(id, data) {
  const el = document.getElementById(id);
  const W = el.clientWidth || 400, H = 220;
  const m = { top: 16, right: 10, bottom: 40, left: 35 };
  const w = W - m.left - m.right, h = H - m.top - m.bottom;
  const sorted = [...data].sort((a, b) => a.year - b.year).slice(-12);

  const svg = d3.select(`#${id}`).append("svg")
    .attr("viewBox", `0 0 ${W} ${H}`).attr("width", "100%")
    .append("g").attr("transform", `translate(${m.left},${m.top})`);

  const x = d3.scaleBand().domain(sorted.map(d => d.year)).range([0, w]).padding(0.25);
  const y = d3.scaleLinear().domain([0, d3.max(sorted, d => d.count)]).nice().range([h, 0]);

  const area = d3.area()
    .x(d => x(d.year) + x.bandwidth() / 2)
    .y0(h).y1(d => y(d.count))
    .curve(d3.curveMonotoneX);

  svg.append("defs").append("linearGradient")
    .attr("id", "yg").attr("gradientUnits", "userSpaceOnUse")
    .attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", h)
    .selectAll("stop")
    .data([{ offset: "0%", color: "rgba(232,255,71,0.25)" }, { offset: "100%", color: "rgba(232,255,71,0)" }])
    .enter().append("stop").attr("offset", d => d.offset).attr("stop-color", d => d.color);

  svg.append("path").datum(sorted).attr("fill", "url(#yg)").attr("d", area);

  const line = d3.line()
    .x(d => x(d.year) + x.bandwidth() / 2)
    .y(d => y(d.count))
    .curve(d3.curveMonotoneX);

  svg.append("path").datum(sorted)
    .attr("fill", "none").attr("stroke", "#e8ff47").attr("stroke-width", 2).attr("d", line);

  svg.selectAll("circle").data(sorted).enter().append("circle")
    .attr("cx", d => x(d.year) + x.bandwidth() / 2)
    .attr("cy", d => y(d.count))
    .attr("r", 4).attr("fill", "#e8ff47")
    .on("mouseover", (event, d) => tooltip.style("opacity", 1)
      .html(`<strong>${d.year}</strong><br>${d.count} games`)
      .style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 30) + "px"))
    .on("mouseout", () => tooltip.style("opacity", 0));

  svg.append("g").attr("class", "axis").attr("transform", `translate(0,${h})`)
    .call(d3.axisBottom(x)
      .tickValues(sorted.filter((_, i) => i % 2 === 0).map(d => d.year))
      .tickFormat(d => d));
  svg.append("g").attr("class", "axis").call(d3.axisLeft(y).ticks(4));
}

function drawMonthChart(id, data) {
  const el = document.getElementById(id);
  const W = el.clientWidth || 400, H = 220;
  const m = { top: 16, right: 10, bottom: 36, left: 35 };
  const w = W - m.left - m.right, h = H - m.top - m.bottom;

  const mapped = data.map(d => ({
    month: monthNames[parseInt(d.month) - 1] || d.month,
    monthNum: parseInt(d.month),
    count: d.count
  })).sort((a, b) => a.monthNum - b.monthNum);

  const svg = d3.select(`#${id}`).append("svg")
    .attr("viewBox", `0 0 ${W} ${H}`).attr("width", "100%")
    .append("g").attr("transform", `translate(${m.left},${m.top})`);

  const x = d3.scalePoint().domain(mapped.map(d => d.month)).range([0, w]).padding(0.5);
  const y = d3.scaleLinear().domain([0, d3.max(mapped, d => d.count)]).nice().range([h, 0]);

  const area = d3.area()
    .x(d => x(d.month)).y0(h).y1(d => y(d.count))
    .curve(d3.curveMonotoneX);

  svg.append("path").datum(mapped).attr("fill", "rgba(71,200,255,0.1)").attr("d", area);

  const line = d3.line()
    .x(d => x(d.month)).y(d => y(d.count))
    .curve(d3.curveMonotoneX);

  svg.append("path").datum(mapped)
    .attr("fill", "none").attr("stroke", "#47c8ff").attr("stroke-width", 2).attr("d", line);

  svg.selectAll(".dot").data(mapped).enter().append("circle")
    .attr("cx", d => x(d.month)).attr("cy", d => y(d.count))
    .attr("r", 4).attr("fill", "#47c8ff").attr("stroke", "#080c14").attr("stroke-width", 2)
    .on("mouseover", function (event, d) {
      d3.select(this).attr("r", 6);
      tooltip.style("opacity", 1)
        .html(`<strong>${d.month}</strong><br>${d.count} games`)
        .style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 30) + "px");
    })
    .on("mouseout", function () {
      d3.select(this).attr("r", 4);
      tooltip.style("opacity", 0);
    });

  svg.append("g").attr("class", "axis").attr("transform", `translate(0,${h})`)
    .call(d3.axisBottom(x));
  svg.append("g").attr("class", "axis").call(d3.axisLeft(y).ticks(4));
}

function drawRatingChart(id, data) {
  const el = document.getElementById(id);
  const W = el.clientWidth || 400, H = 200;
  const m = { top: 20, right: 10, bottom: 30, left: 30 };
  const w = W - m.left - m.right, h = H - m.top - m.bottom;

  const filled = [1, 2, 3, 4, 5].map(r => {
    const f = data.find(d => d.rating === r);
    return { rating: r, count: f ? f.count : 0 };
  });

  const colors = { 1: "#ff4757", 2: "#ffa502", 3: "#eccc68", 4: "#7bed9f", 5: "#e8ff47" };

  const svg = d3.select(`#${id}`).append("svg")
    .attr("viewBox", `0 0 ${W} ${H}`).attr("width", "100%")
    .append("g").attr("transform", `translate(${m.left},${m.top})`);

  const x = d3.scaleBand().domain(filled.map(d => String(d.rating))).range([0, w]).padding(0.3);
  const y = d3.scaleLinear().domain([0, d3.max(filled, d => d.count) || 1]).nice().range([h, 0]);

  svg.append("g").attr("class", "grid")
    .call(d3.axisLeft(y).ticks(4).tickSize(-w).tickFormat(""));

  svg.selectAll(".bar").data(filled).enter().append("rect").attr("class", "bar")
    .attr("x", d => x(String(d.rating))).attr("y", d => y(d.count))
    .attr("width", x.bandwidth()).attr("height", d => h - y(d.count))
    .attr("rx", 5).attr("fill", d => colors[d.rating])
    .on("mouseover", (event, d) => tooltip.style("opacity", 1)
      .html(`<strong>${d.rating} Star</strong><br>${d.count} reviews`)
      .style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 30) + "px"))
    .on("mouseout", () => tooltip.style("opacity", 0));

  svg.selectAll(".bar-label").data(filled).enter().append("text").attr("class", "bar-label")
    .attr("x", d => x(String(d.rating)) + x.bandwidth() / 2)
    .attr("y", d => y(d.count) - 5)
    .attr("text-anchor", "middle")
    .text(d => d.count > 0 ? d.count : "");

  svg.append("g").attr("class", "axis").attr("transform", `translate(0,${h})`)
    .call(d3.axisBottom(x).tickFormat(d => "★".repeat(+d)));
  svg.append("g").attr("class", "axis").call(d3.axisLeft(y).ticks(4));
}

function drawGenreChart(id, data) {
  const top = data.slice(0, 8);
  const el = document.getElementById(id);
  const W = el.clientWidth || 400, H = 220;
  const m = { top: 10, right: 50, bottom: 10, left: 90 };
  const w = W - m.left - m.right, h = H - m.top - m.bottom;

  const svg = d3.select(`#${id}`).append("svg")
    .attr("viewBox", `0 0 ${W} ${H}`).attr("width", "100%")
    .append("g").attr("transform", `translate(${m.left},${m.top})`);

  const y = d3.scaleBand().domain(top.map(d => d.genre)).range([0, h]).padding(0.25);
  const x = d3.scaleLinear().domain([0, d3.max(top, d => d.count)]).range([0, w]);

  svg.append("g").attr("class", "grid")
    .call(d3.axisTop(x).ticks(4).tickSize(-h).tickFormat(""));

  svg.selectAll(".bar").data(top).enter().append("rect").attr("class", "bar")
    .attr("y", d => y(d.genre)).attr("height", y.bandwidth())
    .attr("x", 0).attr("width", d => x(d.count))
    .attr("rx", 4).attr("fill", "#47c8ff")
    .on("mouseover", (event, d) => tooltip.style("opacity", 1)
      .html(`<strong>${d.genre}</strong><br>${d.count} games`)
      .style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 30) + "px"))
    .on("mouseout", () => tooltip.style("opacity", 0));

  svg.selectAll(".bar-label").data(top).enter().append("text").attr("class", "bar-label")
    .attr("x", d => x(d.count) + 5)
    .attr("y", d => y(d.genre) + y.bandwidth() / 2 + 4)
    .text(d => d.count);

  svg.append("g").attr("class", "axis").call(d3.axisLeft(y).tickSize(0));
}

const StatsPage = {
  name: 'StatsPage',
  template: `
    <div>
      <div class="tooltip" id="tooltip"></div>

      <div class="page-header">
        <div class="container">
          <h1>Community <span>Stats</span></h1>
          <p>Data insights from our game library and reviews</p>
        </div>
      </div>

      <div class="container stats-body">
        <div class="row g-4 mb-4 stat-cards justify-content-center">
          <div class="col-auto">
            <div class="stat-card text-center">
              <span class="label">Total Games</span>
              <span class="value">{{ totalGames }}</span>
            </div>
          </div>
          <div class="col-auto">
            <div class="stat-card text-center">
              <span class="label">Total Reviews</span>
              <span class="value">{{ totalReviews }}</span>
            </div>
          </div>
          <div class="col-auto">
            <div class="stat-card text-center">
              <span class="label">Average Rating</span>
              <span class="value">{{ avgRating }}</span>
            </div>
          </div>
        </div>

        <div class="row g-4">
          <div class="col-12 col-lg-6">
            <div class="chart-card">
              <p class="chart-title"><i class="fas fa-calendar-alt"></i> Games by Release Year</p>
              <p class="chart-subtitle">Number of games in our library released each year</p>
              <div id="year-chart"></div>
            </div>
          </div>
          <div class="col-12 col-lg-6">
            <div class="chart-card">
              <p class="chart-title"><i class="fas fa-chart-line"></i> Monthly Release Trend</p>
              <div id="month-chart"></div>
            </div>
          </div>
          <div class="col-12 col-lg-6">
            <div class="chart-card">
              <p class="chart-title"><i class="fas fa-star"></i> Review Rating Distribution</p>
              <div id="rating-chart"></div>
            </div>
          </div>
          <div class="col-12 col-lg-6">
            <div class="chart-card">
              <p class="chart-title"><i class="fas fa-tags"></i> Top Genres in Library</p>
              <div id="genre-chart"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  setup() {
    const { ref, onMounted } = Vue;
    const API = 'http://localhost:3000';
    const tooltip = d3.select("#tooltip");

    const totalGames = ref('—');
    const totalReviews = ref('—');
    const avgRating = ref('—');

    onMounted(() => {
      document.title = 'Game Review Board';
      fetch(`${API}/stats`)
        .then(r => r.json())
        .then(stats => {
          totalReviews.value = stats.totalReviews;

          if (stats.ratingDistribution.length > 0) {
            const total = stats.ratingDistribution.reduce((a, r) => a + r.count, 0);
            const sum = stats.ratingDistribution.reduce((a, r) => a + r.rating * r.count, 0);
            avgRating.value = (sum / total).toFixed(1) + ' ★';
          } else {
            avgRating.value = 'N/A';
          }

          fetch(`${API}/games?limit=500`)
            .then(r => r.json())
            .then(games => {
              totalGames.value = games.length;
            });

          drawChart("year-chart", drawYearChart, stats.gamesByYear);
          drawChart("rating-chart", drawRatingChart, stats.ratingDistribution);
          drawChart("genre-chart", drawGenreChart, stats.genreDistribution);

          fetch(`${API}/stats/months`)
            .then(r => r.json())
            .then(data => drawChart("month-chart", drawMonthChart, data))
            .catch(() => d3.select("#month-chart").html('<div class="empty-chart">No data available</div>'));
        })
        .catch(err => console.error("Failed to load stats:", err));
    });

    return { totalGames, totalReviews, avgRating };
  }
};