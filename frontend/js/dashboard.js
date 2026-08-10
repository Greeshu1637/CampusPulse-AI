/**
 * CampusPulse AI â€“ Dashboard JavaScript
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

    // Nav item active state and navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', function () {
        const page = this.getAttribute('data-page');
        
        // Handle navigation to different pages
        if (page === 'dining') {
          // Navigate to Smart Dining page
          window.location.href = '/mess';
        } else if (page === 'analytics') {
          window.location.href = '/analytics';
        } else if (page === 'complaints') {
          window.location.href = '/complaints';
        } else if (page === 'classroom') {
          window.location.href = '/classroom';
        } else if (page === 'dashboard') {
          window.location.href = '/dashboard';
        }
        // For other pages without routes yet, just update active state
        else {
          document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
          this.classList.add('active');
        }
        
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
      { icon: 'fa-bolt', iconBg: 'rgba(245,158,11,0.12)', iconColor: '#F59E0B', title: 'Energy Alert â€“ Lab Block', desc: 'Power consumption 32% above threshold in Computer Lab.', time: '1 hr ago', unread: true },
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
    { label: 'Total Hostel Students', value: '4,000', change: '+0.5%', dir: 'up', icon: 'fa-users', gradient: 'linear-gradient(135deg,#6C63FF,#9B89FF)', spark: [3950,3960,3970,3975,3980,3985,3990,3992,3995,3998,4000,4000] },
    { label: 'Hostel Occupancy', value: '94.2%', change: '+2.1%', dir: 'up', icon: 'fa-building', gradient: 'linear-gradient(135deg,#10B981,#34D399)', spark: [80,82,85,83,88,86,90,89,92,91,93,94] },
    { label: 'Today\'s Meals Served', value: 'Coming Soon', change: '', dir: 'neutral', icon: 'fa-bowl-food', gradient: 'linear-gradient(135deg,#F59E0B,#FBBF24)', spark: [] },
    { label: 'Average Food Rating', value: 'Coming Soon', change: '', dir: 'neutral', icon: 'fa-star', gradient: 'linear-gradient(135deg,#22D3EE,#6C63FF)', spark: [] },
    { label: 'Pending Complaints', value: 'Coming Soon', change: '', dir: 'neutral', icon: 'fa-triangle-exclamation', gradient: 'linear-gradient(135deg,#EF4444,#F87171)', spark: [] },
    { label: 'Resolved Complaints', value: 'Coming Soon', change: '', dir: 'neutral', icon: 'fa-circle-check', gradient: 'linear-gradient(135deg,#10B981,#34D399)', spark: [] },
    { label: 'Today\'s Feedback', value: 'Coming Soon', change: '', dir: 'neutral', icon: 'fa-comment', gradient: 'linear-gradient(135deg,#8B5CF6,#A78BFA)', spark: [] },
    { label: 'Hostel Notifications', value: 'Coming Soon', change: '', dir: 'neutral', icon: 'fa-bell', gradient: 'linear-gradient(135deg,#06B6D4,#22D3EE)', spark: [] },
  ],

  sparklineCharts: [],

  /**
   * Fetch real KPI data from API
   */
  async fetchKpiData() {
    try {
      const response = await fetch('/api/student/dashboard', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.quick_stats) {
          // Update KPI data with real values from API
          this.updateKpiFromApi(data.quick_stats);
        }
      }
    } catch (error) {
      console.log('Using default KPI values (API not available)');
    }
  },

  /**
   * Update KPI cards with real API data
   */
  updateKpiFromApi(stats) {
    // Update specific KPI cards with real data
    if (stats.attendance_percentage !== undefined) {
      const attendanceCard = this.data.find(k => k.label === 'Total Students');
      if (attendanceCard) {
        // Keep the card structure but could update values if needed
      }
    }
    
    // You can map more fields from stats to KPI cards here
    // For now, we keep the existing design values
  },

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

  /**
   * Initialize KPI Manager
   */
  async init() {
    await this.fetchKpiData();
    this.render();
  },
};

/* ============================================================
   SMART DINING MANAGER
   ============================================================ */
const SmartDiningManager_OLD = {
  currentView: 'today',
  todayMenu: null,
  weeklyMenu: null,

  /**
   * Initialize Smart Dining
   */
  async init() {
    await this.loadTodayMenu();
    this.bindEvents();
  },

  /**
   * Bind UI events
   */
  bindEvents() {
    const todayTab = document.getElementById('todayMenuTab');
    const weekTab = document.getElementById('weekMenuTab');

    if (todayTab) {
      todayTab.addEventListener('click', () => this.switchView('today'));
    }
    if (weekTab) {
      weekTab.addEventListener('click', () => this.switchView('week'));
    }

    // Bind rate and feedback buttons (delegated)
    document.addEventListener('click', (e) => {
      if (e.target.closest('.meal-rate-btn')) {
        e.preventDefault();
        const btn = e.target.closest('.meal-rate-btn');
        const itemId = btn.dataset.itemId;
        const itemName = btn.dataset.itemName;
        this.showRatingModal(itemId, itemName);
      }
      if (e.target.closest('.meal-feedback-btn')) {
        e.preventDefault();
        const btn = e.target.closest('.meal-feedback-btn');
        const itemId = btn.dataset.itemId;
        const itemName = btn.dataset.itemName;
        this.showFeedbackModal(itemId, itemName);
      }
      if (e.target.closest('.mark-attendance-btn')) {
        e.preventDefault();
        const btn = e.target.closest('.mark-attendance-btn');
        const menuId = btn.dataset.menuId;
        const date = btn.dataset.date;
        this.markAttendance(menuId, date);
      }
    });
  },

  /**
   * Switch between today/week view
   */
  switchView(view) {
    this.currentView = view;

    const todayTab = document.getElementById('todayMenuTab');
    const weekTab = document.getElementById('weekMenuTab');
    const todayView = document.getElementById('todayMenuView');
    const weekView = document.getElementById('weekMenuView');

    if (todayTab && weekTab) {
      todayTab.classList.toggle('active', view === 'today');
      weekTab.classList.toggle('active', view === 'week');
    }

    if (view === 'today') {
      if (todayView) todayView.style.display = 'block';
      if (weekView) weekView.style.display = 'none';
      if (!this.todayMenu) this.loadTodayMenu();
    } else {
      if (todayView) todayView.style.display = 'none';
      if (weekView) weekView.style.display = 'block';
      if (!this.weeklyMenu) this.loadWeeklyMenu();
    }
  },

  /**
   * Load today's menu from API
   */
  async loadTodayMenu() {
    const container = document.getElementById('mealsGrid');
    if (!container) return;

    // Show loading
    this.showLoading(container);

    try {
      const response = await fetch('/api/dining/today', {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success && data.menu) {
        this.todayMenu = data.menu;
        this.renderTodayMenu(data.menu);
        this.updateMenuHeader(data.menu);
      } else {
        this.showEmpty(container, 'No menu available for today');
      }
    } catch (error) {
      console.error('Error loading today menu:', error);
      this.showError(container, 'Failed to load today\'s menu. Please try again.');
    }
  },

  /**
   * Load weekly menu from API
   */
  async loadWeeklyMenu() {
    const container = document.getElementById('weekMenuGrid');
    if (!container) return;

    // Show loading
    container.innerHTML = '<div class="loading-spinner"><i class="fa-solid fa-spinner fa-spin"></i> Loading weekly menu...</div>';

    try {
      const response = await fetch('/api/dining/week', {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success && data.menus && data.menus.length > 0) {
        this.weeklyMenu = data.menus;
        this.renderWeeklyMenu(data.menus);
      } else {
        container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-calendar-xmark"></i><p>No weekly menu available</p></div>';
      }
    } catch (error) {
      console.error('Error loading weekly menu:', error);
      container.innerHTML = '<div class="error-state"><i class="fa-solid fa-triangle-exclamation"></i><p>Failed to load weekly menu</p></div>';
    }
  },

  /**
   * Show loading state
   */
  showLoading(container) {
    container.innerHTML = `
      <div class="meal-card skeleton-loading">
        <div class="skeleton-title"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
      </div>
      <div class="meal-card skeleton-loading">
        <div class="skeleton-title"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
      </div>
      <div class="meal-card skeleton-loading">
        <div class="skeleton-title"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
      </div>
      <div class="meal-card skeleton-loading">
        <div class="skeleton-title"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
      </div>`;
  },

  /**
   * Show empty state
   */
  showEmpty(container, message) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1; text-align:center; padding:40px;">
        <i class="fa-solid fa-utensils" style="font-size:3rem; color:var(--text-muted); opacity:0.3; margin-bottom:12px;"></i>
        <p style="color:var(--text-muted); font-size:0.9rem;">${message}</p>
      </div>`;
  },

  /**
   * Show error state
   */
  showError(container, message) {
    container.innerHTML = `
      <div class="error-state" style="grid-column: 1/-1; text-align:center; padding:40px;">
        <i class="fa-solid fa-triangle-exclamation" style="font-size:3rem; color:var(--accent-red); opacity:0.6; margin-bottom:12px;"></i>
        <p style="color:var(--text-muted); font-size:0.9rem;">${message}</p>
        <button onclick="SmartDiningManager.loadTodayMenu()" class="hero-btn hero-btn-secondary" style="margin-top:12px;">
          <i class="fa-solid fa-rotate-right"></i> Retry
        </button>
      </div>`;
  },

  /**
   * Update menu header with date and rating
   */
  updateMenuHeader(menu) {
    const menuDay = document.getElementById('menuDay');
    const menuRating = document.getElementById('menuRating');
    const ratingCount = document.getElementById('ratingCount');

    if (menuDay && menu.date) {
      const date = new Date(menu.date);
      const options = { weekday: 'long', month: 'long', day: 'numeric' };
      menuDay.textContent = date.toLocaleDateString('en-US', options);
    }

    if (menuRating && menu.avg_rating !== undefined) {
      menuRating.textContent = menu.avg_rating.toFixed(1);
    }

    if (ratingCount && menu.rating_count !== undefined) {
      ratingCount.textContent = menu.rating_count;
    }
  },

  /**
   * Render today's menu
   */
  renderTodayMenu(menu) {
    const container = document.getElementById('mealsGrid');
    if (!container) return;

    // Group items by meal type
    const mealTypes = {
      'Breakfast': { icon: 'fa-mug-saucer', time: '7:00 AM â€“ 9:30 AM', color: 'breakfast' },
      'Lunch': { icon: 'fa-bowl-rice', time: '12:00 PM â€“ 2:30 PM', color: 'lunch' },
      'Snacks': { icon: 'fa-cookie', time: '4:00 PM â€“ 5:30 PM', color: 'snacks' },
      'Dinner': { icon: 'fa-moon', time: '7:00 PM â€“ 9:30 PM', color: 'dinner' }
    };

    const groupedItems = {};
    menu.items.forEach(item => {
      if (!groupedItems[item.meal_type]) {
        groupedItems[item.meal_type] = [];
      }
      groupedItems[item.meal_type].push(item);
    });

    let html = '';
    Object.keys(mealTypes).forEach(mealType => {
      const items = groupedItems[mealType] || [];
      const config = mealTypes[mealType];

      html += `
        <div class="meal-card">
          <div class="meal-header">
            <div class="meal-icon ${config.color}">
              <i class="fa-solid ${config.icon}"></i>
            </div>
            <div>
              <h3 class="meal-title">${mealType}</h3>
              <p class="meal-time">${config.time}</p>
            </div>
            ${this.getMealStatus(config.time)}
          </div>
          <div class="meal-items">
            ${items.length > 0 ? items.map(item => this.renderMenuItem(item)).join('') : '<p style="color:var(--text-muted); font-size:0.85rem; padding:12px;">No items available</p>'}
          </div>
          <div class="meal-footer">
            <button class="mark-attendance-btn" data-menu-id="${menu.id}" data-date="${menu.date}">
              <i class="fa-solid fa-check"></i> Mark Attendance
            </button>
          </div>
        </div>`;
    });

    container.innerHTML = html;
  },

  /**
   * Render a single menu item
   */
  renderMenuItem(item) {
    const vegBadge = item.is_veg 
      ? '<span class="item-badge veg"><i class="fa-solid fa-circle"></i> Veg</span>'
      : '<span class="item-badge non-veg"><i class="fa-solid fa-circle"></i> Non-Veg</span>';

    return `
      <div class="menu-item">
        <div class="item-info">
          <span class="item-name">${item.name}</span>
          ${vegBadge}
        </div>
        <div class="item-nutrition">
          <span><i class="fa-solid fa-fire"></i> ${item.calories} Cal</span>
          <span><i class="fa-solid fa-dumbbell"></i> ${item.protein}g Protein</span>
        </div>
        <div class="item-actions" style="display:flex; gap:6px; margin-top:6px;">
          <button class="meal-rate-btn" data-item-id="${item.id}" data-item-name="${item.name}">
            <i class="fa-solid fa-star"></i> Rate
          </button>
          <button class="meal-feedback-btn" data-item-id="${item.id}" data-item-name="${item.name}">
            <i class="fa-solid fa-comment"></i> Feedback
          </button>
        </div>
      </div>`;
  },

  /**
   * Get meal status badge
   */
  getMealStatus(timeStr) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    // Parse time string (e.g., "7:00 AM â€“ 9:30 AM")
    const times = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/g);
    if (!times || times.length < 2) return '<span class="meal-status upcoming">Upcoming</span>';

    const parseTime = (timeStr) => {
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/);
      if (!match) return 0;
      let hour = parseInt(match[1]);
      const minute = parseInt(match[2]);
      const period = match[3];
      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;
      return hour * 60 + minute;
    };

    const startTime = parseTime(times[0]);
    const endTime = parseTime(times[1]);

    if (currentTime >= startTime && currentTime <= endTime) {
      return '<span class="meal-status available">Available Now</span>';
    } else if (currentTime > endTime) {
      return '<span class="meal-status ended">Ended</span>';
    } else {
      return '<span class="meal-status upcoming">Upcoming</span>';
    }
  },

  /**
   * Render weekly menu
   */
  renderWeeklyMenu(menus) {
    const container = document.getElementById('weekMenuGrid');
    if (!container) return;

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date().getDay();

    let html = '';
    menus.forEach(menu => {
      const date = new Date(menu.date);
      const dayIndex = date.getDay();
      const dayName = days[dayIndex];
      const isToday = dayIndex === today;

      const mealTypes = {};
      menu.items.forEach(item => {
        if (!mealTypes[item.meal_type]) {
          mealTypes[item.meal_type] = [];
        }
        mealTypes[item.meal_type].push(item.name);
      });

      html += `
        <div class="day-column ${isToday ? 'active' : ''}">
          <div class="day-header">
            <div class="day-name">${dayName}</div>
            <div class="day-date">
              ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              ${isToday ? '<span class="today-badge">Today</span>' : ''}
            </div>
          </div>
          <div class="day-meals">
            ${Object.entries(mealTypes).map(([type, items]) => `
              <div class="mini-meal">
                <span class="meal-icon-sm ${type.toLowerCase()}">
                  <i class="fa-solid ${this.getMealIcon(type)}"></i>
                </span>
                ${items.slice(0, 2).join(', ')}${items.length > 2 ? '...' : ''}
              </div>
            `).join('')}
          </div>
        </div>`;
    });

    container.innerHTML = html;
  },

  /**
   * Get meal icon by type
   */
  getMealIcon(mealType) {
    const icons = {
      'Breakfast': 'fa-mug-saucer',
      'Lunch': 'fa-bowl-rice',
      'Snacks': 'fa-cookie',
      'Dinner': 'fa-moon'
    };
    return icons[mealType] || 'fa-utensils';
  },

  /**
   * Show rating modal
   */
  showRatingModal(itemId, itemName) {
    // Create modal HTML
    const modalHtml = `
      <div class="modal-overlay" id="ratingModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3><i class="fa-solid fa-star"></i> Rate ${itemName}</h3>
            <button class="modal-close" onclick="SmartDiningManager.closeModal('ratingModal')">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div class="modal-body">
            <p style="color:var(--text-muted); margin-bottom:20px;">How would you rate this item?</p>
            <div class="star-rating" style="display:flex; gap:8px; justify-content:center; margin:20px 0;">
              ${[1,2,3,4,5].map(star => `
                <button class="star-btn" data-rating="${star}" onclick="SmartDiningManager.selectRating(${star})">
                  <i class="fa-solid fa-star"></i>
                </button>
              `).join('')}
            </div>
            <div id="ratingFeedback" style="text-align:center; color:var(--text-muted); font-size:0.9rem; min-height:24px;"></div>
          </div>
          <div class="modal-footer">
            <button class="hero-btn hero-btn-secondary" onclick="SmartDiningManager.closeModal('ratingModal')">Cancel</button>
            <button class="hero-btn hero-btn-primary" id="submitRatingBtn" onclick="SmartDiningManager.submitRating(${itemId})">Submit Rating</button>
          </div>
        </div>
      </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    this.selectedRating = 0;
  },

  /**
   * Select rating
   */
  selectRating(rating) {
    this.selectedRating = rating;
    
    // Update stars
    const stars = document.querySelectorAll('.star-btn');
    stars.forEach((star, index) => {
      if (index < rating) {
        star.classList.add('active');
        star.style.color = 'var(--accent-amber)';
      } else {
        star.classList.remove('active');
        star.style.color = 'var(--text-muted)';
      }
    });

    // Update feedback text
    const feedback = document.getElementById('ratingFeedback');
    const texts = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    if (feedback) feedback.textContent = texts[rating];
  },

  /**
   * Submit rating
   */
  async submitRating(itemId) {
    if (this.selectedRating === 0) {
      alert('Please select a rating');
      return;
    }

    const btn = document.getElementById('submitRatingBtn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
    }

    try {
      const response = await fetch('/api/dining/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          item_id: itemId,
          rating: this.selectedRating
        })
      });

      const data = await response.json();

      if (data.success) {
        this.closeModal('ratingModal');
        this.showToast('Rating submitted successfully!', 'success');
        // Refresh menu to show updated ratings
        await this.loadTodayMenu();
      } else {
        alert(data.message || 'Failed to submit rating');
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = 'Submit Rating';
        }
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = 'Submit Rating';
      }
    }
  },

  /**
   * Show feedback modal
   */
  showFeedbackModal(itemId, itemName) {
    const modalHtml = `
      <div class="modal-overlay" id="feedbackModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3><i class="fa-solid fa-comment"></i> Feedback for ${itemName}</h3>
            <button class="modal-close" onclick="SmartDiningManager.closeModal('feedbackModal')">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div class="modal-body">
            <div style="margin-bottom:16px;">
              <label style="display:block; margin-bottom:8px; font-weight:600; color:var(--text-primary);">Feedback Type</label>
              <select id="feedbackType" class="form-input" style="width:100%; padding:10px; border:1px solid var(--border-color); border-radius:8px; background:var(--bg-secondary);">
                <option value="general">General</option>
                <option value="praise">Praise</option>
                <option value="complaint">Complaint</option>
                <option value="suggestion">Suggestion</option>
              </select>
            </div>
            <div style="margin-bottom:16px;">
              <label style="display:block; margin-bottom:8px; font-weight:600; color:var(--text-primary);">Your Feedback</label>
              <textarea id="feedbackText" class="form-input" rows="4" style="width:100%; padding:10px; border:1px solid var(--border-color); border-radius:8px; background:var(--bg-secondary); resize:vertical;" placeholder="Share your thoughts..."></textarea>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <input type="checkbox" id="feedbackAnonymous" style="width:16px; height:16px; cursor:pointer;">
              <label for="feedbackAnonymous" style="cursor:pointer; user-select:none; color:var(--text-muted);">Submit anonymously</label>
            </div>
          </div>
          <div class="modal-footer">
            <button class="hero-btn hero-btn-secondary" onclick="SmartDiningManager.closeModal('feedbackModal')">Cancel</button>
            <button class="hero-btn hero-btn-primary" id="submitFeedbackBtn" onclick="SmartDiningManager.submitFeedback(${itemId})">Submit Feedback</button>
          </div>
        </div>
      </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  /**
   * Submit feedback
   */
  async submitFeedback(itemId) {
    const feedbackText = document.getElementById('feedbackText').value.trim();
    const feedbackType = document.getElementById('feedbackType').value;
    const isAnonymous = document.getElementById('feedbackAnonymous').checked;

    if (!feedbackText) {
      alert('Please enter your feedback');
      return;
    }

    const btn = document.getElementById('submitFeedbackBtn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
    }

    try {
      const response = await fetch('/api/dining/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          item_id: itemId,
          feedback_text: feedbackText,
          feedback_type: feedbackType,
          is_anonymous: isAnonymous
        })
      });

      const data = await response.json();

      if (data.success) {
        this.closeModal('feedbackModal');
        this.showToast('Feedback submitted successfully!', 'success');
      } else {
        alert(data.message || 'Failed to submit feedback');
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = 'Submit Feedback';
        }
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = 'Submit Feedback';
      }
    }
  },

  /**
   * Mark attendance
   */
  async markAttendance(menuId, date) {
    const confirmed = confirm('Mark your attendance for this meal?');
    if (!confirmed) return;

    try {
      const response = await fetch('/api/dining/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          menu_id: menuId,
          attendance_date: date,
          is_attending: true
        })
      });

      const data = await response.json();

      if (data.success) {
        this.showToast('Attendance marked successfully!', 'success');
      } else {
        alert(data.message || 'Failed to mark attendance');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Failed to mark attendance. Please try again.');
    }
  },

  /**
   * Close modal
   */
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.remove();
  },

  /**
   * Show toast notification
   */
  showToast(message, type = 'info') {
    const colors = {
      success: 'var(--accent-green)',
      error: 'var(--accent-red)',
      info: 'var(--accent-blue)'
    };

    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: ${colors[type]};
      color: white;
      padding: 14px 20px;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      z-index: 10000;
      animation: slideInRight 0.3s ease;
      font-weight: 500;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
};

// KPI Manager extension (renderSparklines)
const KpiManagerExtension = {
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

// Extend KpiManager with sparkline methods
Object.assign(KpiManager, KpiManagerExtension);

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
    try {
      const canvas = document.getElementById('lineChart');
      if (!canvas) {
        console.warn('LineChart canvas not found');
        return;
      }
      console.log('Initializing lineChart...');
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
      console.log('✓ lineChart initialized');
    } catch (error) {
      console.error('Error initializing lineChart:', error);
    }
  },

  initBarChart() {
    try {
      const canvas = document.getElementById('barChart');
      if (!canvas) {
        console.warn('BarChart canvas not found');
        return;
      }
      console.log('Initializing barChart...');
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
      console.log('✓ barChart initialized');
    } catch (error) {
      console.error('Error initializing barChart:', error);
    }
  },

  initDonutChart() {
    try {
      const canvas = document.getElementById('donutChart');
      if (!canvas) {
        console.warn('DonutChart canvas not found');
        return;
      }
      console.log('Initializing donutChart...');
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
      console.log('✓ donutChart initialized');
    } catch (error) {
      console.error('Error initializing donutChart:', error);
    }
  },

  initAreaChart() {
    try {
      const canvas = document.getElementById('areaChart');
      if (!canvas) {
        console.warn('AreaChart canvas not found');
        return;
      }
      console.log('Initializing areaChart...');
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
      console.log('✓ areaChart initialized');
    } catch (error) {
      console.error('Error initializing areaChart:', error);
    }
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
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
      console.error('Chart.js is not loaded!');
      return;
    }
    
    console.log('ChartManager: Initializing charts...');
    this.initLineChart();
    this.initBarChart();
    this.initDonutChart();
    this.initAreaChart();
    this.initHeatmap();
    console.log('ChartManager: All charts initialized');
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
        html += `<div class="heatmap-cell" data-level="${levelData[di][h]}" title="${days[di]} ${h}:00 â€“ Level ${levelData[di][h]}"></div>`;
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
    { name: 'Main Academic Block', icon: 'ðŸ›ï¸', occupancy: 78, temp: 24, power: 420, status: 'online', gradient: 'linear-gradient(135deg,#6C63FF,#9B89FF)' },
    { name: 'Computer Science Block', icon: 'ðŸ’»', occupancy: 92, temp: 22, power: 310, status: 'online', gradient: 'linear-gradient(135deg,#22D3EE,#6C63FF)' },
    { name: 'Hostel Block A', icon: 'ðŸ¢', occupancy: 96, temp: 26, power: 180, status: 'online', gradient: 'linear-gradient(135deg,#10B981,#34D399)' },
    { name: 'Central Library', icon: 'ðŸ“š', occupancy: 85, temp: 21, power: 95, status: 'online', gradient: 'linear-gradient(135deg,#F59E0B,#FBBF24)' },
    { name: 'Mess & Dining Hall', icon: 'ðŸ½ï¸', occupancy: 64, temp: 28, power: 220, status: 'online', gradient: 'linear-gradient(135deg,#EF4444,#F87171)' },
    { name: 'Parking Complex', icon: 'ðŸ…¿ï¸', occupancy: 71, temp: 30, power: 45, status: 'warning', gradient: 'linear-gradient(135deg,#3B82F6,#60A5FA)' },
    { name: 'Sports Complex', icon: 'âš½', occupancy: 45, temp: 32, power: 65, status: 'online', gradient: 'linear-gradient(135deg,#EC4899,#8B5CF6)' },
    { name: 'Admin Block', icon: 'ðŸ—ï¸', occupancy: 88, temp: 23, power: 140, status: 'online', gradient: 'linear-gradient(135deg,#8B5CF6,#6C63FF)' },
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
        <span class="twin-status-badge ${b.status === 'online' ? 'online' : 'warning'}">${b.status === 'online' ? 'â— Online' : 'âš  Warning'}</span>
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
            <span class="twin-stat-value">${b.temp}Â°C</span>
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
    { icon: 'fa-check-circle', bg: 'linear-gradient(135deg,#10B981,#34D399)', title: 'Attendance Marked', desc: 'CS4B batch â€” 92% present. Prof. Mehta.', time: '15 min ago' },
    { icon: 'fa-calendar-check', bg: 'linear-gradient(135deg,#6C63FF,#9B89FF)', title: 'Room Booked', desc: 'Seminar Hall 3 booked for AI Workshop, July 25.', time: '34 min ago' },
    { icon: 'fa-brain', bg: 'linear-gradient(135deg,#EC4899,#8B5CF6)', title: 'AI Alert Generated', desc: 'Unusual energy spike detected in Lab Block C.', time: '1 hr ago' },
    { icon: 'fa-user-plus', bg: 'linear-gradient(135deg,#3B82F6,#60A5FA)', title: 'Student Enrolled', desc: '18 new admissions confirmed for CSE Branch.', time: '2 hr ago' },
  ],

  liveFeed: [
    { icon: 'ðŸš¨', label: 'Security Alert', msg: 'Unauthorized access attempt at Gate 3', time: 'Just now', color: '#EF4444' },
    { icon: 'ðŸ“¶', label: 'Network', msg: 'Bandwidth usage at 78% â€” Lab Block', time: '3 min', color: '#3B82F6' },
    { icon: 'ðŸŽ“', label: 'Academic', msg: 'New assignment uploaded: CS401 Module 5', time: '7 min', color: '#6C63FF' },
    { icon: 'ðŸ½ï¸', label: 'Dining', msg: 'Lunch menu updated â€” 480 students served', time: '12 min', color: '#10B981' },
    { icon: 'ðŸ’¡', label: 'Energy', msg: 'Block A solar panels generating 12.4 kW', time: '18 min', color: '#F59E0B' },
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
    'attendance': 'ðŸ“Š Attendance this week averages **91.4%** across all departments. CS leads at 94.2%, followed by ECE at 92.8%. Two departments â€” Civil and MBA â€” are below the 85% threshold and may need intervention.',
    'hostel': 'ðŸ¢ Hostel Block B has the highest complaint volume this month with **14 unresolved issues**, primarily AC and water supply. Block A is performing best with only 2 minor complaints.',
    'energy': 'âš¡ Predicted energy usage for tomorrow: **4,380 kWh** â€” 3.8% above today. Peak demand expected between 2 PMâ€“5 PM in the Computer Labs. Recommend scheduling non-critical systems during off-peak hours.',
    'library': 'ðŸ“š Top 5 library borrowers this month: Priya S. (28 books), Ravi K. (24), Anjali M. (21), Dev P. (19), Meera R. (18). Computer Science texts account for 42% of all checkouts.',
    'report': 'ðŸ“‹ Monthly Summary Report for July 2025 has been generated. Highlights: Attendance up 2.3%, Complaints down 12%, Energy efficiency improved by 8.4%, Library utilization at 78.5%. Download link sent to your email.',
    'exam': 'ðŸ“… 2 schedule conflicts detected: CS401 overlaps with ECE301 on July 28 (Hall 2). MBA Thesis presentation clashes with Law Moot Court on July 30. Recommended resolutions have been logged for admin review.',
    'default': 'ðŸ¤– I\'ve analyzed the campus data and here\'s my response: This query is being processed using the CampusPulse AI engine v4.1. For specific insights, try asking about attendance, hostels, energy, library usage, or exam schedules. I\'m continuously learning from campus data to provide better recommendations.',
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
      this.addMessage('ðŸ‘‹ Hello, Dr. Kumar! I\'m your CampusPulse AI Copilot. Campus health score is at 85/100. I\'ve detected 3 new insights and 2 alerts requiring your attention. How can I assist you today?', 'ai');
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
   SMART DINING MANAGER
   ============================================================ */
const SmartDiningManager = {
  currentView: 'today',
  todayData: null,
  weekData: null,

  /**
   * Fetch today's menu from API
   */
  async fetchTodayMenu() {
    try {
      const response = await fetch('/api/mess/today', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to load menu');
      }
      
      this.todayData = data;
      return data;
    } catch (error) {
      console.error('Error fetching today\'s menu:', error);
      return null;
    }
  },

  /**
   * Fetch weekly menu from API
   */
  async fetchWeekMenu() {
    try {
      const response = await fetch('/api/mess/week', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to load weekly menu');
      }
      
      this.weekData = data;
      return data;
    } catch (error) {
      console.error('Error fetching weekly menu:', error);
      return null;
    }
  },

  /**
   * Get meal icon based on meal type
   */
  getMealIcon(mealType) {
    const icons = {
      'Breakfast': 'fa-mug-saucer',
      'Lunch': 'fa-bowl-food',
      'Snacks': 'fa-cookie-bite',
      'Dinner': 'fa-plate-wheat'
    };
    return icons[mealType] || 'fa-utensils';
  },

  /**
   * Get status badge HTML
   */
  getStatusBadge(status) {
    const statusMap = {
      upcoming: { class: 'upcoming', icon: 'fa-clock', text: 'Upcoming' },
      ongoing: { class: 'ongoing', icon: 'fa-fire', text: 'Ongoing' },
      completed: { class: 'completed', icon: 'fa-check', text: 'Completed' }
    };
    const info = statusMap[status] || statusMap.upcoming;
    return `<span class="meal-status ${info.class}">
      <i class="fa-solid ${info.icon}"></i> ${info.text}
    </span>`;
  },

  /**
   * Render today's menu
   */
  renderTodayMenu(data) {
    const menuDay = document.getElementById('menuDay');
    const menuRating = document.getElementById('menuRating');
    const ratingCount = document.getElementById('ratingCount');
    const mealsGrid = document.getElementById('mealsGrid');

    if (!mealsGrid) return;

    // Update header
    if (menuDay) menuDay.textContent = data.day || 'Today';
    if (menuRating) menuRating.textContent = (data.rating || 0).toFixed(1);
    if (ratingCount) ratingCount.textContent = data.total_ratings || 0;

    // Clear loading skeleton
    mealsGrid.innerHTML = '';

    // Check if meals exist
    if (!data.meals || data.meals.length === 0) {
      mealsGrid.innerHTML = '<p style="text-align:center;color:var(--text-muted);grid-column:1/-1;padding:40px;">No menu available for today</p>';
      return;
    }

    // Render each meal
    data.meals.forEach(meal => {
      const mealCard = document.createElement('div');
      mealCard.className = 'meal-card';
      
      // Extract meal type
      const mealType = meal.meal_type || meal.type || 'Meal';
      
      // Extract items (handle both string array and object array)
      const items = meal.items.map(item => {
        if (typeof item === 'string') return item;
        if (item.item_name) return item.item_name;
        return '';
      }).filter(item => item !== '');
      
      // Check for special status
      const isSpecial = meal.is_special || false;
      const specialName = meal.special_item_name || '';
      
      mealCard.innerHTML = `
        <div class="meal-card-header">
          <div class="meal-type">
            <i class="fa-solid ${this.getMealIcon(mealType)}"></i>
            ${mealType}
          </div>
          ${this.getStatusBadge(meal.status)}
        </div>
        <div class="meal-time">
          <i class="fa-solid fa-clock"></i>
          ${meal.time || 'Time not specified'}
        </div>
        ${isSpecial ? `<div class="special-badge"><i class="fa-solid fa-star"></i> Special${specialName ? ': ' + specialName : ''}</div>` : ''}
        <div class="meal-items">
          ${items.map(item => `<span class="meal-item-tag">${item}</span>`).join('')}
        </div>
      `;
      
      mealsGrid.appendChild(mealCard);
    });
  },

  /**
   * Render weekly menu
   */
  renderWeekMenu(data) {
    const weekMenuGrid = document.getElementById('weekMenuGrid');
    if (!weekMenuGrid) return;

    weekMenuGrid.innerHTML = '';

    if (!data.week || data.week.length === 0) {
      weekMenuGrid.innerHTML = '<p style="text-align:center;color:var(--text-muted);grid-column:1/-1;padding:40px;">No weekly menu available</p>';
      return;
    }

    data.week.forEach(dayData => {
      const dayCard = document.createElement('div');
      dayCard.className = 'week-day-card';
      
      const mealsHtml = dayData.meals.map(meal => {
        const mealType = meal.meal_type || meal.type || 'Meal';
        const items = meal.items.map(item => {
          if (typeof item === 'string') return item;
          if (item.item_name) return item.item_name;
          return '';
        }).filter(item => item !== '');
        
        return `
          <div class="meal-card" style="padding: 14px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <div style="font-weight:600;color:var(--text-primary);font-size:0.9rem;">
                <i class="fa-solid ${this.getMealIcon(mealType)}"></i> ${mealType}
              </div>
              <span style="font-size:0.7rem;color:var(--text-muted);">${meal.time || ''}</span>
            </div>
            <div class="meal-items">
              ${items.slice(0, 3).map(item => `<span class="meal-item-tag">${item}</span>`).join('')}
              ${items.length > 3 ? `<span class="meal-item-tag">+${items.length - 3} more</span>` : ''}
            </div>
          </div>
        `;
      }).join('');
      
      dayCard.innerHTML = `
        <div class="week-day-header">
          <i class="fa-solid fa-calendar-day"></i>
          ${dayData.day}
        </div>
        <div class="week-day-meals">
          ${mealsHtml}
        </div>
      `;
      
      weekMenuGrid.appendChild(dayCard);
    });
  },

  /**
   * Switch between today and week view
   */
  switchView(view) {
    this.currentView = view;
    
    const todayTab = document.getElementById('todayMenuTab');
    const weekTab = document.getElementById('weekMenuTab');
    const todayView = document.getElementById('todayMenuView');
    const weekView = document.getElementById('weekMenuView');
    
    if (view === 'today') {
      todayTab?.classList.add('active');
      weekTab?.classList.remove('active');
      if (todayView) todayView.style.display = 'block';
      if (weekView) weekView.style.display = 'none';
      
      // Load today's menu if not already loaded
      if (!this.todayData) {
        this.loadTodayMenu();
      }
    } else {
      todayTab?.classList.remove('active');
      weekTab?.classList.add('active');
      if (todayView) todayView.style.display = 'none';
      if (weekView) weekView.style.display = 'block';
      
      // Load weekly menu if not already loaded
      if (!this.weekData) {
        this.loadWeekMenu();
      }
    }
  },

  /**
   * Load today's menu
   */
  async loadTodayMenu() {
    const data = await this.fetchTodayMenu();
    if (data) {
      this.renderTodayMenu(data);
    } else {
      const mealsGrid = document.getElementById('mealsGrid');
      if (mealsGrid) {
        mealsGrid.innerHTML = '<p style="text-align:center;color:var(--accent-red);grid-column:1/-1;padding:40px;"><i class="fa-solid fa-triangle-exclamation"></i> Failed to load menu. Please try again.</p>';
      }
    }
  },

  /**
   * Load weekly menu
   */
  async loadWeekMenu() {
    const weekMenuGrid = document.getElementById('weekMenuGrid');
    if (weekMenuGrid) {
      weekMenuGrid.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:40px;">Loading weekly menu...</p>';
    }
    
    const data = await this.fetchWeekMenu();
    if (data) {
      this.renderWeekMenu(data);
    } else {
      if (weekMenuGrid) {
        weekMenuGrid.innerHTML = '<p style="text-align:center;color:var(--accent-red);padding:40px;"><i class="fa-solid fa-triangle-exclamation"></i> Failed to load weekly menu. Please try again.</p>';
      }
    }
  },

  /**
   * Initialize Smart Dining Manager
   */
  init() {
    // Bind tab buttons
    const todayTab = document.getElementById('todayMenuTab');
    const weekTab = document.getElementById('weekMenuTab');
    
    if (todayTab) {
      todayTab.addEventListener('click', () => this.switchView('today'));
    }
    
    if (weekTab) {
      weekTab.addEventListener('click', () => this.switchView('week'));
    }
    
    // Load today's menu by default
    this.loadTodayMenu();
  }
};

/* ============================================================
   APP INITIALIZATION
   ============================================================ */
document.addEventListener('DOMContentLoaded', async () => {
  ThemeManager.init();
  SidebarManager.init();
  TopbarManager.init();
  await KpiManager.init();

  // Stagger chart initialization to avoid layout jank
  setTimeout(async () => {
    ChartManager.init();
    DigitalTwinManager.render();
    ActivityManager.render();
    CopilotManager.init();
    await SmartDiningManager.init();
    animateScoreRing();
    initTabButtons();
    LiveDataSimulator.start();
  }, 100);
});
