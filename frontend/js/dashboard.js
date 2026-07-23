/**
 * CampusPulse AI – Dashboard JavaScript
 * Handles: Theme, Sidebar, Charts, KPI, Digital Twin, Copilot, Activities, Notifications
 */

'use strict';

/* ============================================================
   THEME MANAGER
   ============================================================ */
const ThemeManager = {
  KEY: 'campuspulse_theme',

  get() {
    return localStorage.getItem(this.KEY) || 'light';
  },

  set(theme) {
    localStorage.setItem(this.KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
    this.updateUI(theme);
    // Re-render charts with new theme colors
    setTimeout(() => ChartManager.updateAllChartColors(), 50);
  },

  toggle() {
    const current = this.get();
    this.set(current === 'light' ? 'dark' : 'light');
  },

  updateUI(theme) {
    const isDark = theme === 'dark';
    const icon = document.getElementById('themeIcon');
    const sidebarIcon = document.getElementById('sidebarThemeIcon');
    const sidebarLabel = document.getElementById('sidebarThemeLabel');
    if (icon) icon.className = isDark ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    if (sidebarIcon) sidebarIcon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    if (sidebarLabel) sidebarLabel.textContent = isDark ? 'Light Mode' : 'Dark Mode';
  },

  init() {
    const saved = this.get();
    document.documentElement.setAttribute('data-theme', saved);
    this.updateUI(saved);

    const toggle = document.getElementById('themeToggle');
    const sidebarBtn = document.getElementById('sidebarThemeBtn');
    if (toggle) toggle.addEventListener('click', () => this.toggle());
    if (sidebarBtn) sidebarBtn.addEventListener('click', () => this.toggle());
  }
};

/* ============================================================
   SIDEBAR MANAGER
   ============================================================ */
const SidebarManager = {
  KEY: 'campuspulse_sidebar_collapsed',

  init() {
    const layout = document.getElementById('appLayout');
    const sidebar = document.getElementById('sidebar');
    const collapseBtn = document.getElementById('sidebarCollapseBtn');
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const overlay = document.getElementById('mobileOverlay');
    const icon = document.getElementById('collapseIcon');
    const topbar = document.querySelector('.topbar');

    const collapsed = localStorage.getItem(this.KEY) === 'true';
    if (collapsed && window.innerWidth > 768) {
      layout.classList.add('sidebar-collapsed');
      if (topbar) topbar.style.left = 'var(--sidebar-collapsed-width)';
      if (icon) icon.className = 'fa-solid fa-chevron-right';
    }

    // Desktop collapse
    if (collapseBtn) {
      collapseBtn.addEventListener('click', () => {
        layout.classList.toggle('sidebar-collapsed');
        const isCollapsed = layout.classList.contains('sidebar-collapsed');
        localStorage.setItem(this.KEY, isCollapsed);
        if (topbar) topbar.style.left = isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)';
        if (icon) icon.className = isCollapsed ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-left';
      });
    }

    // Mobile menu
    if (mobileBtn) {
      mobileBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
        overlay.classList.toggle('active');
      });
    }
    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
      });
    }

    // Nav item active state
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', function () {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        this.classList.add('active');
        // close mobile sidebar
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
      });
    });
  }
};

/* ============================================================
   TOPBAR UTILITIES
   ============================================================ */
const TopbarManager = {
  init() {
    this.setDate();
    this.initSearch();
    this.initProfile();
    this.initNotifications();
  },

  setDate() {
    const el = document.getElementById('topbarDate');
    if (!el) return;
    const now = new Date();
    const opts = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    el.textContent = now.toLocaleDateString('en-IN', opts);
  },

  initSearch() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && input.value.trim()) {
        CopilotManager.submitMessage(input.value.trim());
        input.value = '';
        document.getElementById('copilotSection').scrollIntoView({ behavior: 'smooth' });
      }
    });
  },

  initProfile() {
    const btn = document.getElementById('profileBtn');
    const dropdown = document.getElementById('profileDropdown');
    if (!btn || !dropdown) return;
    btn.addEventListener('click', e => {
      e.stopPropagation();
      dropdown.classList.toggle('open');
      document.getElementById('notifPanel').classList.remove('open');
    });
    document.addEventListener('click', () => dropdown.classList.remove('open'));
  },

  initNotifications() {
    const btn = document.getElementById('notifBtn');
    const panel = document.getElementById('notifPanel');
    const list = document.getElementById('notifList');
    if (!btn || !panel) return;

    const notifications = [
      { icon: 'fa-triangle-exclamation', iconBg: 'rgba(239,68,68,0.12)', iconColor: '#EF4444', title: 'New Complaint Filed', desc: 'Student #4821 reported broken AC in Room 204, Hostel B.', time: '2 min ago', unread: true },
      { icon: 'fa-graduation-cap', iconBg: 'rgba(108,99,255,0.12)', iconColor: '#6C63FF', title: 'Exam Timetable Published', desc: 'Semester 4 final exam schedule is now live.', time: '18 min ago', unread: true },
      { icon: 'fa-bolt', iconBg: 'rgba(245,158,11,0.12)', iconColor: '#F59E0B', title: 'Energy Alert – Lab Block', desc: 'Power consumption 32% above threshold in Computer Lab.', time: '1 hr ago', unread: true },
      { icon: 'fa-user-plus', iconBg: 'rgba(16,185,129,0.12)', iconColor: '#10B981', title: 'Faculty Onboarded', desc: 'Dr. R. Sharma joined the CS Department.', time: '3 hr ago', unread: false },
      { icon: 'fa-book', iconBg: 'rgba(59,130,246,0.12)', iconColor: '#3B82F6', title: 'Library Report Ready', desc: 'Monthly library usage report is available.', time: 'Yesterday', unread: false },
    ];

    if (list) {
      list.innerHTML = notifications.map(n => `
        <div class="notif-item">
          <div class="notif-icon" style="background:${n.iconBg};color:${n.iconColor};">
            <i class="fa-solid ${n.icon}"></i>
          </div>
          <div class="notif-body">
            <div class="notif-title">${n.title}</div>
            <div class="notif-desc">${n.desc}</div>
            <div class="notif-time">${n.time}</div>
          </div>
          ${n.unread ? '<div class="notif-unread-dot"></div>' : ''}
        </div>`).join('');
    }

    btn.addEventListener('click', e => {
      e.stopPropagation();
      panel.classList.toggle('open');
      document.getElementById('profileDropdown').classList.remove('open');
    });
    document.addEventListener('click', () => panel.classList.remove('open'));
  }
};

/* ============================================================
   KPI CARDS
   ============================================================ */
const KpiManager = {
  data: [
    { label: 'Total Students', value: '12,847', change: '+3.2%', dir: 'up', icon: 'fa-users', gradient: 'linear-gradient(135deg,#6C63FF,#9B89FF)', spark: [65,72,68,75,80,78,85,82,88,86,90,92] },
    { label: 'Faculty Members', value: '847', change: '+1.4%', dir: 'up', icon: 'fa-chalkboard-user', gradient: 'linear-gradient(135deg,#22D3EE,#6C63FF)', spark: [40,42,41,45,44,48,47,50,49,52,51,54] },
    { label: 'Active Complaints', value: '24', change: '-8.0%', dir: 'down', icon: 'fa-triangle-exclamation', gradient: 'linear-gradient(135deg,#EF4444,#F87171)', spark: [35,30,28,32,26,24,28,22,25,20,22,19] },
    { label: 'Hostel Occupancy', value: '94.2%', change: '+2.1%', dir: 'up', icon: 'fa-building', gradient: 'linear-gradient(135deg,#10B981,#34D399)', spark: [80,82,85,83,88,86,90,89,92,91,93,94] },
    { label: 'Library Occupancy', value: '78.5%', change: '+12.3%', dir: 'up', icon: 'fa-book', gradient: 'linear-gradient(135deg,#F59E0B,#FBBF24)', spark: [50,55,58,62,65,68,70,72,74,76,78,79] },
    { label: 'Energy Consumed', value: '4,218 kWh', change: '-5.6%', dir: 'down', icon: 'fa-bolt', gradient: 'linear-gradient(135deg,#3B82F6,#60A5FA)', spark: [90,85,88,82,80,78,75,79,72,70,68,65] },
    { label: 'Water Usage', value: '18,400 L', change: '-3.1%', dir: 'down', icon: 'fa-droplet', gradient: 'linear-gradient(135deg,#22D3EE,#3B82F6)', spark: [70,68,65,66,63,60,64,58,56,55,52,50] },
    { label: 'AI Confidence', value: '89.4%', change: '+1.8%', dir: 'up', icon: 'fa-brain', gradient: 'linear-gradient(135deg,#EC4899,#8B5CF6)', spark: [75,77,76,80,79,82,83,85,86,87,88,89] },
  ],

  sparklineCharts: [],

  render() {
    const grid = document.getElementById('kpiGrid');
    if (!grid) return;
    grid.innerHTML = '';

    this.data.forEach((kpi, i) => {
      const card = document.createElement('div');
      card.className = `kpi-card animate-delay-${Math.min(i + 1, 8)}`;
      card.style.setProperty('--card-gradient', kpi.gradient);
      card.innerHTML = `
        <div class="kpi-card-header">
          <div class="kpi-icon"><i class="fa-solid ${kpi.icon}"></i></div>
          <span class="kpi-change ${kpi.dir}">
            <i class="fa-solid fa-arrow-${kpi.dir === 'up' ? 'trend-up' : 'trend-down'}"></i>
            ${kpi.change}
          </span>
        </div>
        <div class="kpi-value">${kpi.value}</div>
        <div class="kpi-label">${kpi.label}</div>
        <div class="kpi-sparkline"><canvas id="spark-${i}" height="40"></canvas></div>`;
      grid.appendChild(card);
    });

    // Render sparklines after DOM insertion
    requestAnimationFrame(() => this.renderSparklines());
  },

  renderSparklines() {
    // Destroy old charts
    this.sparklineCharts.forEach(c => c.destroy());
    this.sparklineCharts = [];

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    this.data.forEach((kpi, i) => {
      const canvas = document.getElementById(`spark-${i}`);
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const [c1, c2] = this.extractColors(kpi.gradient);

      const gradient = ctx.createLinearGradient(0, 0, 0, 40);
      gradient.addColorStop(0, c1 + '44');
      gradient.addColorStop(1, c1 + '00');

      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: kpi.spark.map(() => ''),
          datasets: [{
            data: kpi.spark,
            borderColor: c1,
            backgroundColor: gradient,
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          scales: { x: { display: false }, y: { display: false } },
          animation: { duration: 800, easing: 'easeInOutQuart' },
          elements: { line: { borderCapStyle: 'round' } }
        }
      });
      this.sparklineCharts.push(chart);
    });
  },

  extractColors(gradient) {
    const matches = gradient.match(/#[0-9A-Fa-f]{6}/g) || ['#6C63FF', '#9B89FF'];
    return [matches[0], matches[1] || matches[0]];
  },

  updateSparklineColors() {
    this.renderSparklines();
  }
};

/* ============================================================
   CHART MANAGER
   ============================================================ */
const ChartManager = {
  charts: {},

  getThemeColors() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      gridColor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0',
      textColor: isDark ? '#4E6280' : '#94A3B8',
      purple: isDark ? '#9B89FF' : '#6C63FF',
      cyan: '#22D3EE',
      green: isDark ? '#34D399' : '#10B981',
      amber: '#F59E0B',
      red: isDark ? '#F87171' : '#EF4444',
      blue: isDark ? '#60A5FA' : '#3B82F6',
    };
  },

  baseOptions(tc) {
    return {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { labels: { color: tc.textColor, font: { family: 'Inter', size: 12 }, boxWidth: 12 } },
        tooltip: { backgroundColor: 'rgba(15,23,42,0.9)', titleColor: '#fff', bodyColor: '#94A3B8', padding: 12, cornerRadius: 10, titleFont: { family: 'Inter', weight: '600' }, bodyFont: { family: 'Inter' } }
      },
      scales: {
        x: { grid: { color: tc.gridColor }, ticks: { color: tc.textColor, font: { family: 'Inter', size: 11 } } },
        y: { grid: { color: tc.gridColor }, ticks: { color: tc.textColor, font: { family: 'Inter', size: 11 } } }
      },
      animation: { duration: 900, easing: 'easeInOutQuart' }
    };
  },

  makeGradient(ctx, color1, color2, alpha1 = 0.5, alpha2 = 0.02) {
    const g = ctx.createLinearGradient(0, 0, 0, 260);
    g.addColorStop(0, color1 + Math.round(alpha1 * 255).toString(16).padStart(2, '0'));
    g.addColorStop(1, color1 + Math.round(alpha2 * 255).toString(16).padStart(2, '0'));
    return g;
  },

  initLineChart() {
    const canvas = document.getElementById('lineChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const tc = this.getThemeColors();
    const g1 = this.makeGradient(ctx, '#6C63FF');
    const g2 = this.makeGradient(ctx, '#22D3EE');
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    this.charts.line = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'CS Department', data: [88, 92, 85, 94, 90, 78, 82], borderColor: tc.purple, backgroundColor: g1, borderWidth: 2.5, pointRadius: 4, pointHoverRadius: 6, tension: 0.4, fill: true },
          { label: 'Engineering', data: [75, 79, 82, 80, 85, 70, 76], borderColor: tc.cyan, backgroundColor: g2, borderWidth: 2.5, pointRadius: 4, pointHoverRadius: 6, tension: 0.4, fill: true }
        ]
      },
      options: { ...this.baseOptions(tc), aspectRatio: 2 }
    });
  },

  initBarChart() {
    const canvas = document.getElementById('barChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const tc = this.getThemeColors();
    const labels = ['CS', 'ECE', 'ME', 'Civil', 'MBA', 'Law', 'Med', 'Arts'];
    const colors = [tc.purple, tc.cyan, tc.green, tc.amber, tc.red, tc.blue, '#EC4899', '#8B5CF6'];
    this.charts.bar = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Students Enrolled',
          data: [2400, 1850, 1600, 1200, 980, 750, 1100, 960],
          backgroundColor: colors.map(c => c + 'CC'),
          borderColor: colors,
          borderWidth: 1.5,
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: { ...this.baseOptions(tc), aspectRatio: 2, plugins: { ...this.baseOptions(tc).plugins, legend: { display: false } } }
    });
  },

  initDonutChart() {
    const canvas = document.getElementById('donutChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const tc = this.getThemeColors();
    this.charts.donut = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Academic', 'Hostels', 'Library', 'Dining', 'Sports', 'Admin'],
        datasets: [{
          data: [35, 22, 15, 12, 10, 6],
          backgroundColor: [tc.purple + 'DD', tc.cyan + 'DD', tc.green + 'DD', tc.amber + 'DD', tc.blue + 'DD', '#EC4899DD'],
          borderColor: 'transparent',
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '68%',
        plugins: {
          legend: { position: 'bottom', labels: { color: tc.textColor, font: { family: 'Inter', size: 11 }, padding: 12, boxWidth: 10 } },
          tooltip: { backgroundColor: 'rgba(15,23,42,0.9)', titleColor: '#fff', bodyColor: '#94A3B8', padding: 12, cornerRadius: 10 }
        },
        animation: { duration: 1200, easing: 'easeInOutQuart' }
      }
    });
  },

  initAreaChart() {
    const canvas = document.getElementById('areaChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const tc = this.getThemeColors();
    const gE = this.makeGradient(ctx, '#F59E0B', null, 0.4, 0.02);
    const gW = this.makeGradient(ctx, '#22D3EE', null, 0.4, 0.02);
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    this.charts.area = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Energy (MWh)', data: [420, 390, 410, 380, 440, 460, 480, 470, 450, 430, 410, 395], borderColor: tc.amber, backgroundColor: gE, borderWidth: 2.5, pointRadius: 3, tension: 0.4, fill: true },
          { label: 'Water (KL)', data: [180, 170, 190, 165, 200, 210, 215, 205, 195, 185, 175, 168], borderColor: tc.cyan, backgroundColor: gW, borderWidth: 2.5, pointRadius: 3, tension: 0.4, fill: true }
        ]
      },
      options: { ...this.baseOptions(tc), aspectRatio: 2 }
    });
  },

  updateAllChartColors() {
    KpiManager.updateSparklineColors();
    const tc = this.getThemeColors();
    Object.values(this.charts).forEach(chart => {
      if (!chart) return;
      if (chart.options.scales?.x) {
        chart.options.scales.x.grid.color = tc.gridColor;
        chart.options.scales.x.ticks.color = tc.textColor;
      }
      if (chart.options.scales?.y) {
        chart.options.scales.y.grid.color = tc.gridColor;
        chart.options.scales.y.ticks.color = tc.textColor;
      }
      if (chart.options.plugins?.legend?.labels) {
        chart.options.plugins.legend.labels.color = tc.textColor;
      }
      chart.update('none');
    });
  },

  init() {
    this.initLineChart();
    this.initBarChart();
    this.initDonutChart();
    this.initAreaChart();
    this.initHeatmap();
  },

  initHeatmap() {
    const container = document.getElementById('heatmapContainer');
    if (!container) return;
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const hoursCount = 24;
    const levelData = Array.from({ length: 7 }, () =>
      Array.from({ length: hoursCount }, () => Math.floor(Math.random() * 5))
    );
    let html = '<div class="heatmap-wrapper">';
    html += '<div class="heatmap-days">' + days.map(d => `<div class="heatmap-day-label">${d}</div>`).join('') + '</div>';
    html += '<div style="flex:1;">';
    days.forEach((_, di) => {
      html += '<div class="heatmap-grid">';
      for (let h = 0; h < hoursCount; h++) {
        html += `<div class="heatmap-cell" data-level="${levelData[di][h]}" title="${days[di]} ${h}:00 – Level ${levelData[di][h]}"></div>`;
      }
      html += '</div>';
    });
    html += '<div class="heatmap-label-row">';
    for (let h = 0; h < hoursCount; h += 4) html += `<span>${h}:00</span>`;
    html += '</div></div></div>';
    container.innerHTML = html;
  }
};

/* ============================================================
   DIGITAL TWIN MANAGER
   ============================================================ */
const DigitalTwinManager = {
  buildings: [
    { name: 'Main Academic Block', icon: '🏛️', occupancy: 78, temp: 24, power: 420, status: 'online', gradient: 'linear-gradient(135deg,#6C63FF,#9B89FF)' },
    { name: 'Computer Science Block', icon: '💻', occupancy: 92, temp: 22, power: 310, status: 'online', gradient: 'linear-gradient(135deg,#22D3EE,#6C63FF)' },
    { name: 'Hostel Block A', icon: '🏢', occupancy: 96, temp: 26, power: 180, status: 'online', gradient: 'linear-gradient(135deg,#10B981,#34D399)' },
    { name: 'Central Library', icon: '📚', occupancy: 85, temp: 21, power: 95, status: 'online', gradient: 'linear-gradient(135deg,#F59E0B,#FBBF24)' },
    { name: 'Mess & Dining Hall', icon: '🍽️', occupancy: 64, temp: 28, power: 220, status: 'online', gradient: 'linear-gradient(135deg,#EF4444,#F87171)' },
    { name: 'Parking Complex', icon: '🅿️', occupancy: 71, temp: 30, power: 45, status: 'warning', gradient: 'linear-gradient(135deg,#3B82F6,#60A5FA)' },
    { name: 'Sports Complex', icon: '⚽', occupancy: 45, temp: 32, power: 65, status: 'online', gradient: 'linear-gradient(135deg,#EC4899,#8B5CF6)' },
    { name: 'Admin Block', icon: '🏗️', occupancy: 88, temp: 23, power: 140, status: 'online', gradient: 'linear-gradient(135deg,#8B5CF6,#6C63FF)' },
  ],

  render() {
    const grid = document.getElementById('digitalTwinGrid');
    if (!grid) return;
    grid.innerHTML = '';
    this.buildings.forEach((b, i) => {
      const occColor = b.occupancy > 90 ? '#EF4444' : b.occupancy > 70 ? '#F59E0B' : '#10B981';
      const card = document.createElement('div');
      card.className = `twin-card animate-delay-${Math.min(i + 1, 8)}`;
      card.style.setProperty('--card-gradient', b.gradient);
      card.innerHTML = `
        <div class="twin-card-bg"></div>
        <span class="twin-status-badge ${b.status === 'online' ? 'online' : 'warning'}">${b.status === 'online' ? '● Online' : '⚠ Warning'}</span>
        <div class="twin-card-icon">${b.icon}</div>
        <div class="twin-building-name">${b.name}</div>
        <div class="twin-stats">
          <div class="twin-stat">
            <span class="twin-stat-label"><i class="fa-solid fa-users"></i> Occupancy</span>
            <span class="twin-stat-value" style="color:${occColor};">${b.occupancy}%</span>
          </div>
          <div class="twin-status-bar"><div class="twin-status-fill" style="width:${b.occupancy}%;background:${occColor};"></div></div>
          <div class="twin-stat">
            <span class="twin-stat-label"><i class="fa-solid fa-temperature-half"></i> Temp</span>
            <span class="twin-stat-value">${b.temp}°C</span>
          </div>
          <div class="twin-stat">
            <span class="twin-stat-label"><i class="fa-solid fa-bolt"></i> Power</span>
            <span class="twin-stat-value">${b.power} kW</span>
          </div>
        </div>`;
      grid.appendChild(card);
    });
  }
};

/* ============================================================
   ACTIVITY MANAGER
   ============================================================ */
const ActivityManager = {
  timeline: [
    { icon: 'fa-triangle-exclamation', bg: 'linear-gradient(135deg,#EF4444,#F87171)', title: 'Complaint Resolved', desc: 'AC repair in Hostel B Room 204 completed.', time: '2 min ago' },
    { icon: 'fa-check-circle', bg: 'linear-gradient(135deg,#10B981,#34D399)', title: 'Attendance Marked', desc: 'CS4B batch — 92% present. Prof. Mehta.', time: '15 min ago' },
    { icon: 'fa-calendar-check', bg: 'linear-gradient(135deg,#6C63FF,#9B89FF)', title: 'Room Booked', desc: 'Seminar Hall 3 booked for AI Workshop, July 25.', time: '34 min ago' },
    { icon: 'fa-brain', bg: 'linear-gradient(135deg,#EC4899,#8B5CF6)', title: 'AI Alert Generated', desc: 'Unusual energy spike detected in Lab Block C.', time: '1 hr ago' },
    { icon: 'fa-user-plus', bg: 'linear-gradient(135deg,#3B82F6,#60A5FA)', title: 'Student Enrolled', desc: '18 new admissions confirmed for CSE Branch.', time: '2 hr ago' },
  ],

  liveFeed: [
    { icon: '🚨', label: 'Security Alert', msg: 'Unauthorized access attempt at Gate 3', time: 'Just now', color: '#EF4444' },
    { icon: '📶', label: 'Network', msg: 'Bandwidth usage at 78% — Lab Block', time: '3 min', color: '#3B82F6' },
    { icon: '🎓', label: 'Academic', msg: 'New assignment uploaded: CS401 Module 5', time: '7 min', color: '#6C63FF' },
    { icon: '🍽️', label: 'Dining', msg: 'Lunch menu updated — 480 students served', time: '12 min', color: '#10B981' },
    { icon: '💡', label: 'Energy', msg: 'Block A solar panels generating 12.4 kW', time: '18 min', color: '#F59E0B' },
  ],

  render() {
    // Timeline
    const tl = document.getElementById('activityTimeline');
    if (tl) {
      tl.innerHTML = this.timeline.map(item => `
        <div class="timeline-item">
          <div class="timeline-dot" style="background:${item.bg};"><i class="fa-solid ${item.icon}" style="font-size:11px;"></i></div>
          <div class="timeline-content">
            <div class="timeline-title">${item.title}</div>
            <div class="timeline-desc">${item.desc}</div>
            <div class="timeline-time">${item.time}</div>
          </div>
        </div>`).join('');
    }

    // Live feed
    const feed = document.getElementById('liveFeed');
    if (feed) {
      feed.innerHTML = this.liveFeed.map(item => `
        <div class="status-item" style="border-left:3px solid ${item.color};">
          <div class="status-left">
            <span style="font-size:1.2rem;">${item.icon}</span>
            <div>
              <div style="font-size:0.8rem;font-weight:600;color:var(--text-primary);">${item.label}</div>
              <div style="font-size:0.75rem;color:var(--text-muted);">${item.msg}</div>
            </div>
          </div>
          <span style="font-size:0.7rem;color:var(--text-muted);white-space:nowrap;">${item.time}</span>
        </div>`).join('');
    }
  }
};

/* ============================================================
   AI COPILOT MANAGER
   ============================================================ */
const CopilotManager = {
  suggestions: [
    'Show attendance trend this week',
    'Which hostel has highest complaints?',
    'Predict energy usage for tomorrow',
    'List top 5 library borrowers',
    'Generate monthly summary report',
    'Show exam schedule conflicts',
  ],

  responses: {
    'attendance': '📊 Attendance this week averages **91.4%** across all departments. CS leads at 94.2%, followed by ECE at 92.8%. Two departments — Civil and MBA — are below the 85% threshold and may need intervention.',
    'hostel': '🏢 Hostel Block B has the highest complaint volume this month with **14 unresolved issues**, primarily AC and water supply. Block A is performing best with only 2 minor complaints.',
    'energy': '⚡ Predicted energy usage for tomorrow: **4,380 kWh** — 3.8% above today. Peak demand expected between 2 PM–5 PM in the Computer Labs. Recommend scheduling non-critical systems during off-peak hours.',
    'library': '📚 Top 5 library borrowers this month: Priya S. (28 books), Ravi K. (24), Anjali M. (21), Dev P. (19), Meera R. (18). Computer Science texts account for 42% of all checkouts.',
    'report': '📋 Monthly Summary Report for July 2025 has been generated. Highlights: Attendance up 2.3%, Complaints down 12%, Energy efficiency improved by 8.4%, Library utilization at 78.5%. Download link sent to your email.',
    'exam': '📅 2 schedule conflicts detected: CS401 overlaps with ECE301 on July 28 (Hall 2). MBA Thesis presentation clashes with Law Moot Court on July 30. Recommended resolutions have been logged for admin review.',
    'default': '🤖 I\'ve analyzed the campus data and here\'s my response: This query is being processed using the CampusPulse AI engine v4.1. For specific insights, try asking about attendance, hostels, energy, library usage, or exam schedules. I\'m continuously learning from campus data to provide better recommendations.',
  },

  getResponse(message) {
    const lower = message.toLowerCase();
    if (lower.includes('attend')) return this.responses.attendance;
    if (lower.includes('hostel') || lower.includes('complaint')) return this.responses.hostel;
    if (lower.includes('energy') || lower.includes('power')) return this.responses.energy;
    if (lower.includes('library') || lower.includes('book')) return this.responses.library;
    if (lower.includes('report') || lower.includes('summary')) return this.responses.report;
    if (lower.includes('exam') || lower.includes('schedule')) return this.responses.exam;
    return this.responses.default;
  },

  addMessage(text, role) {
    const container = document.getElementById('copilotMessages');
    if (!container) return;
    const isUser = role === 'user';
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const row = document.createElement('div');
    row.className = `message-row ${isUser ? 'user' : 'ai'}`;
    row.innerHTML = `
      <div class="message-avatar ${isUser ? 'user-avatar' : 'ai-avatar'}">
        <i class="fa-solid ${isUser ? 'fa-user' : 'fa-brain'}"></i>
      </div>
      <div>
        <div class="message-bubble">${text}</div>
        <span class="message-time">${time}</span>
      </div>`;
    container.appendChild(row);
    container.scrollTop = container.scrollHeight;
  },

  addTypingIndicator() {
    const container = document.getElementById('copilotMessages');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'message-row ai';
    el.id = 'typingIndicator';
    el.innerHTML = `
      <div class="message-avatar ai-avatar"><i class="fa-solid fa-brain"></i></div>
      <div>
        <div class="message-bubble" style="display:flex;gap:5px;align-items:center;padding:14px 16px;">
          <span style="width:6px;height:6px;background:var(--accent-purple);border-radius:50%;animation:pulse 1s infinite 0s;display:block;"></span>
          <span style="width:6px;height:6px;background:var(--accent-purple);border-radius:50%;animation:pulse 1s infinite 0.2s;display:block;"></span>
          <span style="width:6px;height:6px;background:var(--accent-purple);border-radius:50%;animation:pulse 1s infinite 0.4s;display:block;"></span>
        </div>
      </div>`;
    container.appendChild(el);
    container.scrollTop = container.scrollHeight;
  },

  removeTypingIndicator() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
  },

  submitMessage(text) {
    if (!text.trim()) return;
    this.addMessage(text, 'user');
    this.addTypingIndicator();
    setTimeout(() => {
      this.removeTypingIndicator();
      this.addMessage(this.getResponse(text), 'ai');
    }, 1000 + Math.random() * 600);
  },

  init() {
    // Initial greeting
    setTimeout(() => {
      this.addMessage('👋 Hello, Dr. Kumar! I\'m your CampusPulse AI Copilot. Campus health score is at 85/100. I\'ve detected 3 new insights and 2 alerts requiring your attention. How can I assist you today?', 'ai');
    }, 400);

    // Suggestions
    const suggestionsEl = document.getElementById('copilotSuggestions');
    if (suggestionsEl) {
      this.suggestions.forEach(s => {
        const chip = document.createElement('span');
        chip.className = 'suggestion-chip';
        chip.textContent = s;
        chip.addEventListener('click', () => {
          document.getElementById('copilotInput').value = s;
          this.submitMessage(s);
          document.getElementById('copilotInput').value = '';
        });
        suggestionsEl.appendChild(chip);
      });
    }

    // Send button
    const sendBtn = document.getElementById('copilotSendBtn');
    const input = document.getElementById('copilotInput');
    if (sendBtn && input) {
      sendBtn.addEventListener('click', () => {
        const val = input.value.trim();
        if (val) { this.submitMessage(val); input.value = ''; }
      });
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          const val = input.value.trim();
          if (val) { this.submitMessage(val); input.value = ''; }
        }
      });
    }

    // Quick action buttons
    document.querySelectorAll('.quick-action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.textContent.trim();
        this.submitMessage(text);
      });
    });
  }
};

/* ============================================================
   ANALYTICS TAB SWITCHER
   ============================================================ */
function switchAnalyticsTab(btn, period) {
  document.querySelectorAll('#analyticsSection .tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const weeklyData = {
    line: [[88, 92, 85, 94, 90, 78, 82], [75, 79, 82, 80, 85, 70, 76]],
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  };
  const monthlyData = {
    line: [[82, 85, 88, 84, 90, 87, 92, 89, 86, 91, 88, 93], [70, 74, 77, 73, 80, 76, 82, 79, 75, 83, 80, 85]],
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  };
  const d = period === 'weekly' ? weeklyData : monthlyData;
  const chart = ChartManager.charts.line;
  if (chart) {
    chart.data.labels = d.labels;
    chart.data.datasets[0].data = d.line[0];
    chart.data.datasets[1].data = d.line[1];
    chart.update();
  }
}

/* ============================================================
   SCORE RING ANIMATION
   ============================================================ */
function animateScoreRing() {
  const ring = document.getElementById('scoreRing');
  const scoreEl = document.getElementById('scoreValue');
  if (!ring || !scoreEl) return;
  const score = 85;
  const circumference = 2 * Math.PI * 45; // r=45
  const offset = circumference - (score / 100) * circumference;
  ring.style.strokeDasharray = circumference;
  ring.style.strokeDashoffset = circumference;
  ring.style.transition = 'stroke-dashoffset 1.5s ease';
  requestAnimationFrame(() => {
    setTimeout(() => { ring.style.strokeDashoffset = offset; }, 100);
  });
  let current = 0;
  const step = score / 60;
  const timer = setInterval(() => {
    current = Math.min(current + step, score);
    scoreEl.textContent = Math.round(current);
    if (current >= score) clearInterval(timer);
  }, 25);
}

/* ============================================================
   TAB BUTTONS (Generic)
   ============================================================ */
function initTabButtons() {
  document.querySelectorAll('.section-actions').forEach(group => {
    group.querySelectorAll('.tab-btn').forEach(btn => {
      if (!btn.getAttribute('onclick')) {
        btn.addEventListener('click', function () {
          group.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
          this.classList.add('active');
        });
      }
    });
  });
}

/* ============================================================
   LIVE DATA SIMULATION
   ============================================================ */
const LiveDataSimulator = {
  start() {
    // Simulate real-time KPI value updates
    setInterval(() => {
      const kpiValues = document.querySelectorAll('.kpi-value');
      if (kpiValues.length > 0) {
        // Subtly update AI Confidence value
        const aiCard = kpiValues[7];
        if (aiCard) {
          const base = 89.4;
          const jitter = (Math.random() - 0.5) * 0.4;
          aiCard.textContent = (base + jitter).toFixed(1) + '%';
        }
      }
    }, 4000);

    // Simulate live chart updates (area chart)
    setInterval(() => {
      const chart = ChartManager.charts.area;
      if (!chart) return;
      chart.data.datasets.forEach(ds => {
        const last = ds.data[ds.data.length - 1];
        const jitter = (Math.random() - 0.5) * 20;
        ds.data.push(Math.round(Math.max(100, last + jitter)));
        ds.data.shift();
      });
      chart.update('none');
    }, 5000);
  }
};

/* ============================================================
   APP INITIALIZATION
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  SidebarManager.init();
  TopbarManager.init();
  KpiManager.render();

  // Stagger chart initialization to avoid layout jank
  setTimeout(() => {
    ChartManager.init();
    DigitalTwinManager.render();
    ActivityManager.render();
    CopilotManager.init();
    animateScoreRing();
    initTabButtons();
    LiveDataSimulator.start();
  }, 100);
});
