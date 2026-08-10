/**
 * ============================================================
 * CampusPulse AI — Student Dashboard JavaScript
 * File: frontend/js/student-dashboard.js
 * 
 * Modules:
 * 1. Theme Manager (Dark/Light + localStorage persistence)
 * 2. Sidebar Manager (Collapse/expand, mobile menu)
 * 3. Authentication Check (Verify login, redirect if not authenticated)
 * 4. Data Fetcher (Fetch from /api/student/dashboard endpoint)
 * 5. Dashboard Renderer (Render all cards with data)
 * 6. User Menu Handler (Dropdown, logout)
 * 7. Refresh Handler (Reload data without page refresh)
 * 8. Error Handler (Display errors gracefully)
 * 9. Initialization
 * ============================================================
 */

'use strict';


/* ============================================================
   1. THEME MANAGER
   Handles dark/light mode toggle with localStorage persistence.
   Syncs with login theme using same key.
   ============================================================ */
const ThemeManager = (function () {
  const STORAGE_KEY = 'campuspulse_theme';
  const html = document.documentElement;
  const toggleBtn = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const themeText = document.getElementById('themeText');

  /**
   * Get current theme from localStorage (default: 'light')
   */
  function getTheme() {
    return localStorage.getItem(STORAGE_KEY) || 'light';
  }

  /**
   * Apply theme to document and update UI
   */
  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    const isDark = theme === 'dark';

    // Update icon and text
    if (themeIcon) {
      themeIcon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
    if (themeText) {
      themeText.textContent = isDark ? 'Light Mode' : 'Dark Mode';
    }

    // Update aria-label on the toggle button
    if (toggleBtn) {
      toggleBtn.setAttribute(
        'aria-label',
        isDark ? 'Switch to light mode' : 'Switch to dark mode'
      );
    }

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, theme);
  }

  /**
   * Toggle between dark and light
   */
  function toggleTheme() {
    const current = getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  }

  /**
   * Initialize theme manager
   */
  function init() {
    // Apply saved theme on load
    const saved = getTheme();
    applyTheme(saved);

    // Bind toggle button
    if (toggleBtn) {
      toggleBtn.addEventListener('click', toggleTheme);
    }
  }

  return { init };
})();


/* ============================================================
   2. SIDEBAR MANAGER
   Handles sidebar collapse/expand and mobile menu toggle.
   ============================================================ */
const SidebarManager = (function () {
  const STORAGE_KEY = 'campuspulse_sidebar_collapsed';
  const sidebar = document.getElementById('sidebar');
  const main = document.getElementById('main');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  let isCollapsed = localStorage.getItem(STORAGE_KEY) === 'true';

  /**
   * Check if mobile view
   */
  function isMobile() {
    return window.innerWidth < 1024;
  }

  /**
   * Collapse sidebar
   */
  function collapse() {
    if (!sidebar || !main) return;
    
    sidebar.classList.add('collapsed');
    main.classList.add('sidebar-collapsed');
    isCollapsed = true;
    localStorage.setItem(STORAGE_KEY, 'true');
  }

  /**
   * Expand sidebar
   */
  function expand() {
    if (!sidebar || !main) return;
    
    sidebar.classList.remove('collapsed');
    main.classList.remove('sidebar-collapsed');
    isCollapsed = false;
    localStorage.setItem(STORAGE_KEY, 'false');
  }

  /**
   * Toggle sidebar
   */
  function toggle() {
    if (isCollapsed) {
      expand();
    } else {
      collapse();
    }
  }

  /**
   * Close sidebar on mobile
   */
  function closeMobile() {
    if (isMobile() && sidebar) {
      sidebar.classList.remove('mobile-open');
    }
  }

  /**
   * Open sidebar on mobile
   */
  function openMobile() {
    if (isMobile() && sidebar) {
      sidebar.classList.add('mobile-open');
    }
  }

  /**
   * Toggle mobile menu
   */
  function toggleMobile() {
    if (!sidebar) return;
    
    if (sidebar.classList.contains('mobile-open')) {
      closeMobile();
    } else {
      openMobile();
    }
  }

  /**
   * Handle window resize
   */
  function handleResize() {
    if (!isMobile()) {
      closeMobile();
    }
  }

  /**
   * Initialize sidebar manager
   */
  function init() {
    // Restore collapsed state on desktop
    if (!isMobile() && isCollapsed) {
      collapse();
    }

    // Bind sidebar toggle (desktop)
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', toggle);
    }

    // Bind mobile menu toggle
    if (mobileMenuToggle) {
      mobileMenuToggle.addEventListener('click', toggleMobile);
    }

    // Close mobile menu when clicking on nav items
    const navItems = document.querySelectorAll('.sidebar__item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        closeMobile();
      });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (isMobile() && sidebar && sidebar.classList.contains('mobile-open')) {
        if (!sidebar.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
          closeMobile();
        }
      }
    });

    // Handle window resize
    window.addEventListener('resize', handleResize);
  }

  return { init };
})();


/* ============================================================
   3. AUTHENTICATION CHECK
   Verify user is logged in, redirect to login if not.
   ============================================================ */
const AuthCheck = (function () {
  /**
   * Check if user is authenticated
   * In production, this would verify the session with the backend
   */
  async function check() {
    try {
      const response = await fetch('/api/student/dashboard', {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        // Not authenticated, redirect to login
        window.location.href = '/frontend/pages/login.html';
        return false;
      }

      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      // On error, redirect to login
      window.location.href = '/frontend/pages/login.html';
      return false;
    }
  }

  return { check };
})();


/* ============================================================
   4. DATA FETCHER
   Fetch dashboard data from /api/student/dashboard endpoint.
   ============================================================ */
const DataFetcher = (function () {
  const API_URL = '/api/student/dashboard';

  /**
   * Fetch dashboard data
   */
  async function fetchDashboardData() {
    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to load dashboard data');
      }

      return data;
    } catch (error) {
      console.error('Data fetch error:', error);
      throw error;
    }
  }

  return { fetchDashboardData };
})();


/* ============================================================
   5. DASHBOARD RENDERER
   Render all dashboard cards with fetched data.
   ============================================================ */
const DashboardRenderer = (function () {
  /**
   * Format date to readable format
   */
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  /**
   * Render user info
   */
  function renderUserInfo(user) {
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    const userAvatar = document.getElementById('userAvatar');
    const welcomeName = document.getElementById('welcomeName');

    if (userName) userName.textContent = user.name || 'Student';
    if (userRole) userRole.textContent = user.role || 'Student';
    if (welcomeName) welcomeName.textContent = user.name || 'Student';

    // Update avatar
    if (userAvatar) {
      if (user.picture) {
        userAvatar.src = user.picture;
      } else {
        userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'Student')}&background=6366f1&color=fff`;
      }
    }
  }

  /**
   * Render current date
   */
  function renderDate(today) {
    const currentDate = document.getElementById('currentDate');
    if (currentDate && today) {
      currentDate.textContent = `${today.day}, ${formatDate(today.date)}`;
    }
  }

  /**
   * Render quick stats
   */
  function renderQuickStats(stats) {
    const attendanceValue = document.getElementById('attendanceValue');
    const classesTodayValue = document.getElementById('classesTodayValue');
    const assignmentsValue = document.getElementById('assignmentsValue');
    const messBalanceValue = document.getElementById('messBalanceValue');

    if (attendanceValue) attendanceValue.textContent = `${stats.attendance_percentage}%`;
    if (classesTodayValue) classesTodayValue.textContent = stats.classes_today;
    if (assignmentsValue) assignmentsValue.textContent = stats.pending_assignments;
    if (messBalanceValue) messBalanceValue.textContent = `₹${stats.mess_balance}`;
  }

  /**
   * Get status badge HTML
   */
  function getStatusBadge(status) {
    const statusMap = {
      upcoming: { class: 'badge--info', text: 'Upcoming', icon: 'fa-clock' },
      ongoing: { class: 'badge--success', text: 'Ongoing', icon: 'fa-circle-dot' },
      completed: { class: 'badge--secondary', text: 'Completed', icon: 'fa-check' }
    };
    
    const statusInfo = statusMap[status] || statusMap.upcoming;
    return `<span class="badge ${statusInfo.class}">
      <i class="fa-solid ${statusInfo.icon}"></i>
      ${statusInfo.text}
    </span>`;
  }

  /**
   * Render today's classes
   */
  function renderClasses(classes) {
    const container = document.getElementById('classesContainer');
    if (!container) return;

    if (classes.length === 0) {
      container.innerHTML = '<p class="empty-state">No classes scheduled for today</p>';
      return;
    }

    const html = classes.map(cls => `
      <div class="class-item">
        <div class="class-item__header">
          <div class="class-item__title">
            <h4>${cls.subject}</h4>
            <span class="class-item__code">${cls.code}</span>
          </div>
          ${getStatusBadge(cls.status)}
        </div>
        <div class="class-item__details">
          <div class="class-item__detail">
            <i class="fa-solid fa-clock"></i>
            <span>${cls.time}</span>
          </div>
          <div class="class-item__detail">
            <i class="fa-solid fa-location-dot"></i>
            <span>${cls.room}</span>
          </div>
          <div class="class-item__detail">
            <i class="fa-solid fa-chalkboard-user"></i>
            <span>${cls.professor}</span>
          </div>
        </div>
      </div>
    `).join('');

    container.innerHTML = html;
  }

  /**
   * Render empty classrooms
   */
  function renderClassrooms(classrooms) {
    const container = document.getElementById('classroomsContainer');
    if (!container) return;

    if (classrooms.length === 0) {
      container.innerHTML = '<p class="empty-state">No empty classrooms available</p>';
      return;
    }

    const html = classrooms.map(room => `
      <div class="room-item">
        <div class="room-item__header">
          <h4>${room.name}</h4>
          <span class="room-item__capacity">
            <i class="fa-solid fa-users"></i>
            ${room.capacity}
          </span>
        </div>
        <div class="room-item__facilities">
          ${room.facilities.map(f => `<span class="facility-tag">${f}</span>`).join('')}
        </div>
        <div class="room-item__footer">
          <span class="room-item__available">
            <i class="fa-solid fa-clock"></i>
            Available until ${room.available_until}
          </span>
        </div>
      </div>
    `).join('');

    container.innerHTML = html;
  }

  /**
   * Get meal status badge
   */
  function getMealStatusBadge(status) {
    const statusMap = {
      upcoming: { class: 'badge--info', text: 'Upcoming', icon: 'fa-clock' },
      ongoing: { class: 'badge--success', text: 'Ongoing', icon: 'fa-fire' },
      completed: { class: 'badge--secondary', text: 'Completed', icon: 'fa-check' }
    };
    
    const statusInfo = statusMap[status] || statusMap.upcoming;
    return `<span class="badge ${statusInfo.class}">
      <i class="fa-solid ${statusInfo.icon}"></i>
      ${statusInfo.text}
    </span>`;
  }

  /**
   * Render mess menu
   */
  function renderMessMenu(menu) {
    const container = document.getElementById('messMenuContainer');
    if (!container) return;

    if (!menu || !menu.meals || menu.meals.length === 0) {
      container.innerHTML = '<p class="empty-state">No menu available for today</p>';
      return;
    }

    const html = `
      <div class="mess-menu">
        <div class="mess-menu__header">
          <div class="mess-menu__date">
            <i class="fa-solid fa-calendar-day"></i>
            <span>${menu.day}</span>
          </div>
          <div class="mess-menu__rating">
            <i class="fa-solid fa-star"></i>
            <span>${menu.rating}/5.0 (${menu.total_ratings} ratings)</span>
          </div>
        </div>
        <div class="mess-menu__meals">
          ${menu.meals.map(meal => {
            // Handle both API structures: meal.type and meal.meal_type
            const mealType = meal.meal_type || meal.type;
            
            // Handle items: array of strings or array of objects with item_name
            const items = meal.items.map(item => {
              if (typeof item === 'string') {
                return item;
              } else if (item.item_name) {
                return item.item_name;
              }
              return '';
            }).filter(item => item !== '');
            
            // Check for special status
            const isSpecial = meal.is_special || meal.special;
            const specialName = meal.special_item_name || meal.special_item;
            
            return `
              <div class="meal-item ${isSpecial ? 'meal-item--special' : ''}">
                <div class="meal-item__header">
                  <div class="meal-item__title">
                    <h4>${mealType}</h4>
                    ${isSpecial ? `<span class="meal-special-badge"><i class="fa-solid fa-star"></i> Special${specialName ? ': ' + specialName : ''}</span>` : ''}
                  </div>
                  ${getMealStatusBadge(meal.status)}
                </div>
                <div class="meal-item__time">
                  <i class="fa-solid fa-clock"></i>
                  <span>${meal.time}</span>
                </div>
                <div class="meal-item__items">
                  ${items.map(item => `<span class="meal-tag">${item}</span>`).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  /**
   * Get priority badge
   */
  function getPriorityBadge(priority) {
    const priorityMap = {
      high: { class: 'badge--danger', text: 'High', icon: 'fa-circle-exclamation' },
      medium: { class: 'badge--warning', text: 'Medium', icon: 'fa-circle-info' },
      low: { class: 'badge--info', text: 'Low', icon: 'fa-circle' }
    };
    
    const priorityInfo = priorityMap[priority] || priorityMap.low;
    return `<span class="badge ${priorityInfo.class}">
      <i class="fa-solid ${priorityInfo.icon}"></i>
      ${priorityInfo.text}
    </span>`;
  }

  /**
   * Get complaint status badge
   */
  function getComplaintStatusBadge(status) {
    const statusMap = {
      pending: { class: 'badge--warning', text: 'Pending', icon: 'fa-clock' },
      in_progress: { class: 'badge--info', text: 'In Progress', icon: 'fa-spinner' },
      resolved: { class: 'badge--success', text: 'Resolved', icon: 'fa-check' }
    };
    
    const statusInfo = statusMap[status] || statusMap.pending;
    return `<span class="badge ${statusInfo.class}">
      <i class="fa-solid ${statusInfo.icon}"></i>
      ${statusInfo.text}
    </span>`;
  }

  /**
   * Render complaints
   */
  function renderComplaints(complaints) {
    const container = document.getElementById('complaintsContainer');
    if (!container) return;

    if (complaints.length === 0) {
      container.innerHTML = '<p class="empty-state">No pending complaints</p>';
      return;
    }

    const html = complaints.map(complaint => `
      <div class="complaint-item">
        <div class="complaint-item__header">
          <h4>${complaint.title}</h4>
          <div class="complaint-item__badges">
            ${getPriorityBadge(complaint.priority)}
            ${getComplaintStatusBadge(complaint.status)}
          </div>
        </div>
        <div class="complaint-item__details">
          <div class="complaint-item__detail">
            <i class="fa-solid fa-tag"></i>
            <span>${complaint.category}</span>
          </div>
          <div class="complaint-item__detail">
            <i class="fa-solid fa-calendar"></i>
            <span>${new Date(complaint.submitted_date).toLocaleDateString()}</span>
          </div>
          ${complaint.assigned_to ? `
            <div class="complaint-item__detail">
              <i class="fa-solid fa-user-gear"></i>
              <span>${complaint.assigned_to}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');

    container.innerHTML = html;
  }

  /**
   * Get announcement priority icon
   */
  function getAnnouncementIcon(icon) {
    return icon || 'fa-bullhorn';
  }

  /**
   * Get announcement priority badge
   */
  function getAnnouncementPriorityBadge(priority) {
    const priorityMap = {
      high: { class: 'badge--danger', text: 'Important' },
      medium: { class: 'badge--warning', text: 'Notice' },
      low: { class: 'badge--info', text: 'Info' }
    };
    
    const priorityInfo = priorityMap[priority] || priorityMap.low;
    return `<span class="badge ${priorityInfo.class}">${priorityInfo.text}</span>`;
  }

  /**
   * Render announcements
   */
  function renderAnnouncements(announcements) {
    const container = document.getElementById('announcementsContainer');
    if (!container) return;

    if (announcements.length === 0) {
      container.innerHTML = '<p class="empty-state">No announcements</p>';
      return;
    }

    const html = announcements.map(announcement => `
      <div class="announcement-item">
        <div class="announcement-item__icon">
          <i class="fa-solid ${getAnnouncementIcon(announcement.icon)}"></i>
        </div>
        <div class="announcement-item__content">
          <div class="announcement-item__header">
            <h4>${announcement.title}</h4>
            ${getAnnouncementPriorityBadge(announcement.priority)}
          </div>
          <p>${announcement.content}</p>
          <div class="announcement-item__footer">
            <span class="announcement-item__meta">
              <i class="fa-solid fa-user"></i>
              ${announcement.published_by}
            </span>
            <span class="announcement-item__meta">
              <i class="fa-solid fa-calendar"></i>
              ${new Date(announcement.published_date).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    `).join('');

    container.innerHTML = html;
  }

  /**
   * Render all dashboard data
   */
  function renderDashboard(data) {
    renderUserInfo(data.user);
    renderDate(data.today);
    renderQuickStats(data.quick_stats);
    renderClasses(data.todays_classes);
    renderClassrooms(data.empty_classrooms);
    renderMessMenu(data.mess_menu);
    renderComplaints(data.pending_complaints);
    renderAnnouncements(data.announcements);
  }

  return { renderDashboard };
})();


/* ============================================================
   6. USER MENU HANDLER
   Handle user dropdown menu and logout.
   ============================================================ */
const UserMenuHandler = (function () {
  const userMenu = document.getElementById('userMenu');
  const userDropdown = document.getElementById('userDropdown');
  const logoutBtn = document.getElementById('logoutBtn');

  /**
   * Toggle dropdown
   */
  function toggleDropdown() {
    if (!userDropdown) return;
    userDropdown.classList.toggle('open');
  }

  /**
   * Close dropdown
   */
  function closeDropdown() {
    if (!userDropdown) return;
    userDropdown.classList.remove('open');
  }

  /**
   * Handle logout
   */
  async function handleLogout(e) {
    e.preventDefault();

    try {
      const response = await fetch('/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      // Redirect to login regardless of response
      window.location.href = '/frontend/pages/login.html';
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect to login on error
      window.location.href = '/frontend/pages/login.html';
    }
  }

  /**
   * Initialize user menu handler
   */
  function init() {
    // Toggle dropdown on user menu click
    if (userMenu) {
      userMenu.addEventListener('click', toggleDropdown);
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (userMenu && userDropdown && !userMenu.contains(e.target)) {
        closeDropdown();
      }
    });

    // Handle logout
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }
  }

  return { init };
})();


/* ============================================================
   7. REFRESH HANDLER
   Reload dashboard data without page refresh.
   ============================================================ */
const RefreshHandler = (function () {
  const refreshBtn = document.getElementById('refreshBtn');
  let isRefreshing = false;

  /**
   * Refresh dashboard data
   */
  async function refresh() {
    if (isRefreshing) return;

    try {
      isRefreshing = true;

      // Add loading animation to button
      if (refreshBtn) {
        refreshBtn.classList.add('spinning');
      }

      // Fetch new data
      const data = await DataFetcher.fetchDashboardData();

      // Render new data
      DashboardRenderer.renderDashboard(data);

      // Show success feedback (optional)
      console.log('Dashboard refreshed successfully');
    } catch (error) {
      console.error('Refresh error:', error);
      ErrorHandler.show('Failed to refresh dashboard data');
    } finally {
      isRefreshing = false;

      // Remove loading animation
      if (refreshBtn) {
        setTimeout(() => {
          refreshBtn.classList.remove('spinning');
        }, 500);
      }
    }
  }

  /**
   * Initialize refresh handler
   */
  function init() {
    if (refreshBtn) {
      refreshBtn.addEventListener('click', refresh);
    }
  }

  return { init, refresh };
})();


/* ============================================================
   8. ERROR HANDLER
   Display errors gracefully with toast notifications.
   ============================================================ */
const ErrorHandler = (function () {
  /**
   * Show error message
   */
  function show(message) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast toast--error';
    toast.innerHTML = `
      <i class="fa-solid fa-circle-exclamation"></i>
      <span>${message}</span>
    `;

    // Add to document
    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);

    // Remove toast after 5 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 5000);
  }

  /**
   * Show success message
   */
  function showSuccess(message) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast toast--success';
    toast.innerHTML = `
      <i class="fa-solid fa-circle-check"></i>
      <span>${message}</span>
    `;

    // Add to document
    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);

    // Remove toast after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }

  return { show, showSuccess };
})();


/* ============================================================
   9. INITIALIZATION
   Initialize all modules and load dashboard data.
   ============================================================ */
async function initializeDashboard() {
  try {
    // Initialize UI modules
    ThemeManager.init();
    SidebarManager.init();
    UserMenuHandler.init();
    RefreshHandler.init();

    // Check authentication
    const isAuthenticated = await AuthCheck.check();
    if (!isAuthenticated) {
      return;
    }

    // Fetch and render dashboard data
    const data = await DataFetcher.fetchDashboardData();
    DashboardRenderer.renderDashboard(data);

    console.log('✓ CampusPulse AI Dashboard — All modules initialized');
  } catch (error) {
    console.error('Dashboard initialization error:', error);
    ErrorHandler.show('Failed to load dashboard. Please refresh the page.');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeDashboard);


/* ============================================================
   END OF student-dashboard.js
   ============================================================ */
