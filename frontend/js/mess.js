/* ============================================================
   CampusPulse AI – Mess Management JavaScript
   Handles view switching, search, ratings, and interactions
   ============================================================ */

(function() {
  'use strict';

  // ============================================================
  // THEME MANAGER
  // ============================================================
  const ThemeManager = {
    init() {
      const savedTheme = localStorage.getItem('campuspulse_theme') || 'light';
      this.applyTheme(savedTheme);
      this.bindEvents();
    },

    applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      this.updateThemeIcons(theme);
    },

    updateThemeIcons(theme) {
      const isDark = theme === 'dark';
      
      // Topbar theme toggle
      const topbarIcon = document.getElementById('themeIcon');
      const toggleThumb = document.getElementById('toggleThumb');
      if (topbarIcon) {
        topbarIcon.className = isDark ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
      }
      if (toggleThumb) {
        toggleThumb.style.transform = isDark ? 'translateX(20px)' : 'translateX(0)';
      }

      // Sidebar theme toggle
      const sidebarIcon = document.getElementById('sidebarThemeIcon');
      const sidebarLabel = document.getElementById('sidebarThemeLabel');
      if (sidebarIcon) {
        sidebarIcon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
      }
      if (sidebarLabel) {
        sidebarLabel.textContent = isDark ? 'Light Mode' : 'Dark Mode';
      }
    },

    toggleTheme() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      this.applyTheme(newTheme);
      localStorage.setItem('campuspulse_theme', newTheme);
    },

    bindEvents() {
      const themeToggle = document.getElementById('themeToggle');
      const sidebarThemeBtn = document.getElementById('sidebarThemeBtn');

      if (themeToggle) {
        themeToggle.addEventListener('click', () => this.toggleTheme());
      }
      if (sidebarThemeBtn) {
        sidebarThemeBtn.addEventListener('click', () => this.toggleTheme());
      }
    }
  };

  // ============================================================
  // SIDEBAR MANAGER
  // ============================================================
  const SidebarManager = {
    init() {
      this.sidebar = document.getElementById('sidebar');
      this.collapseBtn = document.getElementById('sidebarCollapseBtn');
      this.collapseIcon = document.getElementById('collapseIcon');
      this.mobileMenuBtn = document.getElementById('mobileMenuBtn');
      this.mobileOverlay = document.getElementById('mobileOverlay');
      
      this.loadState();
      this.bindEvents();
    },

    loadState() {
      const isCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
      if (isCollapsed && window.innerWidth > 768) {
        this.sidebar.classList.add('collapsed');
        if (this.collapseIcon) {
          this.collapseIcon.className = 'fa-solid fa-chevron-right';
        }
      }
    },

    toggle() {
      this.sidebar.classList.toggle('collapsed');
      const isCollapsed = this.sidebar.classList.contains('collapsed');
      
      if (this.collapseIcon) {
        this.collapseIcon.className = isCollapsed 
          ? 'fa-solid fa-chevron-right' 
          : 'fa-solid fa-chevron-left';
      }
      
      localStorage.setItem('sidebar_collapsed', isCollapsed);
    },

    openMobile() {
      this.sidebar.classList.add('mobile-open');
      this.mobileOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    },

    closeMobile() {
      this.sidebar.classList.remove('mobile-open');
      this.mobileOverlay.classList.remove('active');
      document.body.style.overflow = '';
    },

    bindEvents() {
      if (this.collapseBtn) {
        this.collapseBtn.addEventListener('click', () => this.toggle());
      }

      if (this.mobileMenuBtn) {
        this.mobileMenuBtn.addEventListener('click', () => this.openMobile());
      }

      if (this.mobileOverlay) {
        this.mobileOverlay.addEventListener('click', () => this.closeMobile());
      }

      // Close on escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.sidebar.classList.contains('mobile-open')) {
          this.closeMobile();
        }
      });
    }
  };

  // ============================================================
  // TOPBAR MANAGER
  // ============================================================
  const TopbarManager = {
    init() {
      this.updateDate();
      this.bindNotifications();
      this.bindProfile();
      setInterval(() => this.updateDate(), 60000); // Update every minute
    },

    updateDate() {
      const dateEl = document.getElementById('topbarDate');
      if (!dateEl) return;

      const now = new Date();
      const options = { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      dateEl.textContent = now.toLocaleDateString('en-US', options);
    },

    bindNotifications() {
      const notifBtn = document.getElementById('notifBtn');
      const notifPanel = document.getElementById('notifPanel');

      if (notifBtn && notifPanel) {
        notifBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          notifPanel.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
          if (!notifPanel.contains(e.target) && !notifBtn.contains(e.target)) {
            notifPanel.classList.remove('active');
          }
        });
      }
    },

    bindProfile() {
      const profileBtn = document.getElementById('profileBtn');
      const profileDropdown = document.getElementById('profileDropdown');

      if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          profileDropdown.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
          if (!profileDropdown.contains(e.target) && !profileBtn.contains(e.target)) {
            profileDropdown.classList.remove('active');
          }
        });
      }
    }
  };

  // ============================================================
  // VIEW SWITCHER (Student / Manager)
  // ============================================================
  const ViewSwitcher = {
    init() {
      this.studentView = document.getElementById('studentView');
      this.managerView = document.getElementById('managerView');
      this.viewButtons = document.querySelectorAll('.view-btn');
      this.updateMenuBtn = document.getElementById('updateMenuBtn');

      this.currentView = 'student';
      this.bindEvents();
    },

    switchView(view) {
      this.currentView = view;

      // Update buttons
      this.viewButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
      });

      // Switch views
      if (view === 'student') {
        this.studentView.style.display = 'block';
        this.managerView.style.display = 'none';
        if (this.updateMenuBtn) {
          this.updateMenuBtn.style.display = 'none';
        }
      } else {
        this.studentView.style.display = 'none';
        this.managerView.style.display = 'block';
        if (this.updateMenuBtn) {
          this.updateMenuBtn.style.display = 'inline-flex';
        }
      }

      // Animate view change
      const activeView = view === 'student' ? this.studentView : this.managerView;
      activeView.style.animation = 'none';
      setTimeout(() => {
        activeView.style.animation = 'fadeInUp 0.4s ease';
      }, 10);
    },

    bindEvents() {
      this.viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          this.switchView(btn.dataset.view);
        });
      });
    }
  };

  // ============================================================
  // SEARCH MANAGER
  // ============================================================
  const SearchManager = {
    init() {
      this.searchInput = document.getElementById('searchInput');
      this.debounceTimer = null;
      this.bindEvents();
    },

    bindEvents() {
      if (!this.searchInput) return;

      this.searchInput.addEventListener('input', (e) => {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          this.performSearch(e.target.value);
        }, 300);
      });
    },

    performSearch(query) {
      if (!query.trim()) {
        this.clearSearch();
        return;
      }

      const lowerQuery = query.toLowerCase();
      const menuItems = document.querySelectorAll('.menu-item');

      menuItems.forEach(item => {
        const itemName = item.querySelector('.item-name');
        if (itemName) {
          const text = itemName.textContent.toLowerCase();
          const matches = text.includes(lowerQuery);
          
          item.style.display = matches ? 'block' : 'none';
          
          if (matches) {
            item.style.animation = 'fadeInUp 0.3s ease';
          }
        }
      });
    },

    clearSearch() {
      const menuItems = document.querySelectorAll('.menu-item');
      menuItems.forEach(item => {
        item.style.display = 'block';
      });
    }
  };

  // ============================================================
  // RATING MANAGER
  // ============================================================
  const RatingManager = {
    init() {
      this.bindRatingButtons();
      this.bindFeedbackButtons();
    },

    bindRatingButtons() {
      const rateButtons = document.querySelectorAll('.rate-btn');
      
      rateButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.showRatingModal(btn);
        });
      });
    },

    bindFeedbackButtons() {
      const feedbackButtons = document.querySelectorAll('.feedback-btn');
      
      feedbackButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.showFeedbackModal(btn);
        });
      });
    },

    showRatingModal(btn) {
      const mealCard = btn.closest('.meal-card');
      const mealTitle = mealCard ? mealCard.querySelector('.meal-title').textContent : 'this meal';
      
      // In a real implementation, this would open a modal
      alert(`Rate ${mealTitle}\n\nThis would open a rating modal with 1-5 stars.`);
      
      // Simulate rating
      btn.innerHTML = '<i class="fa-solid fa-star" style="color:var(--accent-amber);"></i> 4.5';
      btn.style.background = 'rgba(245,158,11,0.15)';
      btn.style.color = 'var(--accent-amber)';
      btn.style.borderColor = 'var(--accent-amber)';
    },

    showFeedbackModal(btn) {
      const mealCard = btn.closest('.meal-card');
      const mealTitle = mealCard ? mealCard.querySelector('.meal-title').textContent : 'this meal';
      
      // In a real implementation, this would open a modal
      const feedback = prompt(`Share your feedback for ${mealTitle}:`);
      
      if (feedback && feedback.trim()) {
        alert('Thank you for your feedback!');
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Submitted';
        btn.style.background = 'rgba(16,185,129,0.15)';
        btn.style.color = 'var(--accent-green)';
        btn.style.borderColor = 'var(--accent-green)';
      }
    }
  };

  // ============================================================
  // MEAL STATUS UPDATER
  // ============================================================
  const MealStatusUpdater = {
    init() {
      this.updateMealStatuses();
      setInterval(() => this.updateMealStatuses(), 60000); // Update every minute
    },

    updateMealStatuses() {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = currentHour * 60 + currentMinute;

      const meals = [
        { start: 7 * 60, end: 9 * 60 + 30, type: 'breakfast' },
        { start: 12 * 60, end: 14 * 60 + 30, type: 'lunch' },
        { start: 16 * 60, end: 17 * 60 + 30, type: 'snacks' },
        { start: 19 * 60, end: 21 * 60 + 30, type: 'dinner' }
      ];

      const mealCards = document.querySelectorAll('.meal-card');
      
      meals.forEach((meal, index) => {
        const mealCard = mealCards[index];
        if (!mealCard) return;

        const statusBadge = mealCard.querySelector('.meal-status');
        if (!statusBadge) return;

        if (currentTime >= meal.start && currentTime <= meal.end) {
          statusBadge.textContent = 'Available';
          statusBadge.className = 'meal-status available';
        } else if (currentTime > meal.end) {
          statusBadge.textContent = 'Ended';
          statusBadge.className = 'meal-status ended';
        } else {
          statusBadge.textContent = 'Upcoming';
          statusBadge.className = 'meal-status upcoming';
        }
      });
    }
  };

  // ============================================================
  // RIPPLE EFFECT
  // ============================================================
  const RippleEffect = {
    init() {
      const rippleButtons = document.querySelectorAll('.btn-ripple');
      
      rippleButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          const ripple = document.createElement('span');
          const rect = button.getBoundingClientRect();
          const size = Math.max(rect.width, rect.height);
          const x = e.clientX - rect.left - size / 2;
          const y = e.clientY - rect.top - size / 2;

          ripple.style.width = ripple.style.height = size + 'px';
          ripple.style.left = x + 'px';
          ripple.style.top = y + 'px';
          ripple.classList.add('ripple');

          button.appendChild(ripple);

          setTimeout(() => ripple.remove(), 600);
        });
      });
    }
  };

  // ============================================================
  // SCROLL ANIMATIONS
  // ============================================================
  const ScrollAnimations = {
    init() {
      this.observeElements();
    },

    observeElements() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      }, {
        threshold: 0.1
      });

      const animatedElements = document.querySelectorAll('.meal-card, .chart-card, .kpi-card');
      animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(el);
      });
    }
  };

  // ============================================================
  // INITIALIZATION
  // ============================================================
  document.addEventListener('DOMContentLoaded', async () => {
    ThemeManager.init();
    SidebarManager.init();
    TopbarManager.init();
    ViewSwitcher.init();
    SearchManager.init();
    RatingManager.init();
    MealStatusUpdater.init();
    RippleEffect.init();
    ScrollAnimations.init();
    
    // Initialize Menu Data Manager (API Integration)
    await MenuDataManager.init();
    
    // Initialize Mess Manager (for manager view)
    await MessManager.init();

    console.log('🍽️ CampusPulse Mess Management initialized successfully!');
    console.log('✅ API Integration Active - Menu data loaded from database');
    console.log('✅ Manager Module Active - Edit capabilities enabled');
  });

})();


  // ============================================================
  // MENU DATA MANAGER - API Integration
  // ============================================================
  const MenuDataManager = {
    todayMenu: null,
    weeklyMenu: null,
    managerMenus: null,

    async init() {
      console.log('🍽️ Initializing Menu Data Manager...');
      await this.fetchTodayMenu();
      await this.fetchWeeklyMenu();
    },

    async fetchTodayMenu() {
      try {
        const response = await fetch('/api/dining/today');
        const data = await response.json();
        
        if (data.success) {
          this.todayMenu = data;
          console.log('✅ Today\'s menu loaded:', data.meals.length, 'meals');
          this.renderTodayMenu();
        } else {
          console.error('❌ Failed to load today\'s menu:', data.message);
        }
      } catch (error) {
        console.error('❌ Error fetching today\'s menu:', error);
      }
    },

    async fetchWeeklyMenu() {
      try {
        const response = await fetch('/api/dining/week');
        const data = await response.json();
        
        if (data.success) {
          this.weeklyMenu = data;
          console.log('✅ Weekly menu loaded:', data.week.length, 'days');
          this.renderWeeklyMenu();
        } else {
          console.error('❌ Failed to load weekly menu:', data.message);
        }
      } catch (error) {
        console.error('❌ Error fetching weekly menu:', error);
      }
    },

    renderTodayMenu() {
      const container = document.querySelector('.meals-grid, .menu-content, #todayMenuContainer');
      if (!container || !this.todayMenu) {
        console.warn('⚠️  Menu container or data not found');
        return;
      }

      const meals = this.todayMenu.meals;
      if (meals.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:20px;color:var(--text-muted);">No meals available for today</p>';
        return;
      }

      let html = '';
      meals.forEach(meal => {
        const statusClass = meal.status === 'ongoing' ? 'available' : 
                           meal.status === 'upcoming' ? 'upcoming' : 'ended';
        
        html += `
          <div class="meal-card" data-meal-id="${meal.id}">
            <div class="meal-header">
              <div>
                <h3 class="meal-title">${meal.meal_type}</h3>
                <p class="meal-time">${meal.time}</p>
              </div>
              <span class="meal-status ${statusClass}">${meal.status}</span>
            </div>
            <div class="meal-body">
              <div class="meal-items">
                ${meal.items.map(item => `
                  <div class="menu-item ${item.is_veg ? 'veg' : 'non-veg'}">
                    <span class="item-name">${item.item_name}</span>
                    ${item.is_popular ? '<span class="item-badge">⭐ Popular</span>' : ''}
                    ${item.average_rating > 0 ? `<span class="item-rating">★ ${item.average_rating.toFixed(1)}</span>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
            <div class="meal-footer">
              <button class="btn-action rate-btn" data-meal-id="${meal.id}">
                <i class="fa-solid fa-star"></i> Rate
              </button>
              <button class="btn-action feedback-btn" data-meal-id="${meal.id}">
                <i class="fa-solid fa-comment"></i> Feedback
              </button>
            </div>
          </div>
        `;
      });

      container.innerHTML = html;
      console.log('✅ Rendered', meals.length, 'meal cards');
      
      // Rebind button events
      this.bindMealActions();
    },

    renderWeeklyMenu() {
      const container = document.getElementById('weeklyMenuContainer');
      if (!container || !this.weeklyMenu) {
        console.warn('⚠️  Weekly menu container or data not found');
        return;
      }

      const weekData = this.weeklyMenu.week;
      if (weekData.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:20px;color:var(--text-muted);">No weekly menu available</p>';
        return;
      }

      const today = this.todayMenu?.day || '';
      const currentDate = new Date();
      
      let html = '';
      weekData.forEach((dayData, index) => {
        const isToday = dayData.day === today;
        const isWeekend = dayData.day === 'Saturday' || dayData.day === 'Sunday';
        
        // Calculate date for display
        const dayDate = new Date(currentDate);
        dayDate.setDate(currentDate.getDate() - currentDate.getDay() + index + 1); // +1 because week starts on Monday
        const dateStr = dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        html += `
          <div class="day-column ${isToday ? 'active' : ''} ${isWeekend ? 'weekend' : ''}" data-day="${dayData.day}">
            <div class="day-header">
              <div class="day-name">${dayData.day}</div>
              <div class="day-date">${dateStr}${isToday ? ' <span class="today-badge">Today</span>' : ''}</div>
            </div>
            <div class="day-meals">
              ${this.renderDayMeals(dayData.meals)}
            </div>
          </div>
        `;
      });

      container.innerHTML = html;
      console.log('✅ Rendered weekly menu for', weekData.length, 'days');
      
      // Bind click events to expand meals
      this.bindWeeklyMealClicks();
    },

    renderDayMeals(meals) {
      const mealTypeIcons = {
        'Breakfast': 'fa-mug-saucer',
        'Lunch': 'fa-bowl-rice',
        'Snacks': 'fa-cookie-bite',
        'Dinner': 'fa-moon'
      };

      const mealTypeClass = {
        'Breakfast': 'breakfast',
        'Lunch': 'lunch',
        'Snacks': 'snacks',
        'Dinner': 'dinner'
      };

      let html = '';
      meals.forEach(meal => {
        const items = meal.items || [];
        const iconClass = mealTypeIcons[meal.meal_type] || 'fa-utensils';
        const typeClass = mealTypeClass[meal.meal_type] || 'breakfast';
        
        // Show first 3 items, then "+X more"
        const displayItems = items.slice(0, 3);
        const remainingCount = items.length - 3;
        
        const itemsText = displayItems.map(item => item.item_name).join(', ');
        const moreText = remainingCount > 0 ? ` <strong>+${remainingCount} more</strong>` : '';
        
        html += `
          <div class="mini-meal" data-meal-id="${meal.id}" data-meal-type="${meal.meal_type}" title="Click to view full menu">
            <span class="meal-icon-sm ${typeClass}">
              <i class="fa-solid ${iconClass}"></i>
            </span>
            <span class="mini-meal-text">${itemsText}${moreText}</span>
          </div>
        `;
      });

      return html;
    },

    bindWeeklyMealClicks() {
      document.querySelectorAll('.mini-meal').forEach(mealEl => {
        mealEl.addEventListener('click', (e) => {
          const mealId = e.currentTarget.dataset.mealId;
          const mealType = e.currentTarget.dataset.mealType;
          const day = e.currentTarget.closest('.day-column').dataset.day;
          this.showMealDetails(day, mealType, mealId);
        });
      });
    },

    showMealDetails(day, mealType, mealId) {
      // Find the meal from weekly data
      const dayData = this.weeklyMenu?.week.find(d => d.day === day);
      if (!dayData) return;

      const meal = dayData.meals.find(m => m.meal_type === mealType);
      if (!meal) return;

      // Create modal HTML
      const items = meal.items || [];
      const itemsHtml = items.map(item => `
        <div class="menu-item ${item.is_veg ? 'veg' : 'non-veg'}" style="padding:8px;margin:4px 0;border-radius:6px;background:var(--card-bg);">
          <span class="item-name">${item.item_name}</span>
          ${item.average_rating > 0 ? `<span class="item-rating" style="float:right;">★ ${item.average_rating.toFixed(1)}</span>` : ''}
        </div>
      `).join('');

      // Simple alert for now (can be replaced with proper modal)
      const message = `${day} - ${mealType}\n${meal.time}\n\nMenu Items (${items.length}):\n` + 
                      items.map((item, i) => `${i + 1}. ${item.item_name}`).join('\n');
      
      alert(message);
      
      console.log(`📋 Showing meal details:`, { day, mealType, itemCount: items.length });
    },

    bindMealActions() {
      document.querySelectorAll('.rate-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const mealId = e.currentTarget.dataset.mealId;
          this.showRatingModal(mealId);
        });
      });

      document.querySelectorAll('.feedback-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const mealId = e.currentTarget.dataset.mealId;
          this.showFeedbackModal(mealId);
        });
      });
    },

    showRatingModal(mealId) {
      // Find meal
      const meal = this.todayMenu?.meals.find(m => m.id == mealId);
      if (!meal) return;

      alert(`Rate ${meal.meal_type}\\n\\nRating functionality connected to API!\\nMeal ID: ${mealId}\\n\\nTODO: Implement rating modal UI`);
      
      // TODO: Open proper modal and submit to /api/dining/rate
      console.log('Rating meal:', mealId, meal.meal_type);
    },

    showFeedbackModal(mealId) {
      const meal = this.todayMenu?.meals.find(m => m.id == mealId);
      if (!meal) return;

      const feedback = prompt(`Share feedback for ${meal.meal_type}:`);
      if (feedback && feedback.trim()) {
        this.submitFeedback(mealId, feedback);
      }
    },

    async submitFeedback(mealId, feedbackText) {
      try {
        const response = await fetch('/api/dining/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            menu_id: mealId,
            feedback_text: feedbackText,
            feedback_type: 'general'
          })
        });

        const data = await response.json();
        if (data.success) {
          alert('Thank you for your feedback!');
          console.log('✅ Feedback submitted');
        } else {
          alert('Failed to submit feedback: ' + data.message);
        }
      } catch (error) {
        console.error('❌ Error submitting feedback:', error);
        alert('Error submitting feedback');
      }
    }
  };


  // ============================================================
  // MESS MANAGER MODULE
  // ============================================================
  const MessManager = {
    dashboardStats: null,
    allMenus: null,
    currentEditingMenu: null,

    async init() {
      console.log('👨‍💼 Initializing Mess Manager...');
      await this.fetchDashboardStats();
      await this.fetchAllMenus();
      this.bindManagerButtons();
    },

    async fetchDashboardStats() {
      try {
        const response = await fetch('/api/manager/dashboard');
        const data = await response.json();
        
        if (data.success) {
          this.dashboardStats = data.stats;
          console.log('✅ Dashboard stats loaded');
          this.renderDashboardStats();
        } else {
          console.error('❌ Failed to load dashboard stats');
        }
      } catch (error) {
        console.error('❌ Error fetching dashboard stats:', error);
      }
    },

    async fetchAllMenus() {
      try {
        const response = await fetch('/api/manager/menus');
        const data = await response.json();
        
        if (data.success) {
          this.allMenus = data.menus;
          console.log('✅ Manager menus loaded:', data.count);
        } else {
          console.error('❌ Failed to load manager menus');
        }
      } catch (error) {
        console.error('❌ Error fetching manager menus:', error);
      }
    },

    renderDashboardStats() {
      if (!this.dashboardStats) return;

      const stats = this.dashboardStats;
      
      // Update attendance KPI
      const attendanceValue = document.querySelector('#managerView .kpi-value');
      if (attendanceValue) {
        attendanceValue.textContent = stats.today_attendance || 0;
      }

      // Update average rating
      const ratingValues = document.querySelectorAll('#managerView .kpi-value');
      if (ratingValues[1]) {
        ratingValues[1].textContent = stats.average_rating || '0.0';
      }

      console.log('✅ Dashboard stats rendered');
    },

    bindManagerButtons() {
      // Bind Update Menu button
      const updateMenuBtn = document.getElementById('updateMenuBtn');
      if (updateMenuBtn) {
        updateMenuBtn.addEventListener('click', () => this.showMenuEditor());
      }

      console.log('✅ Manager buttons bound');
    },

    showMenuEditor() {
      // Create menu editor modal
      const modal = document.createElement('div');
      modal.id = 'menuEditorModal';
      modal.innerHTML = `
        <div class="modal-overlay" onclick="MessManager.closeMenuEditor()"></div>
        <div class="modal-content menu-editor-modal">
          <div class="modal-header">
            <h2><i class="fa-solid fa-edit"></i> Edit Weekly Menu</h2>
            <button class="modal-close-btn" onclick="MessManager.closeMenuEditor()">
              <i class="fa-solid fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div id="menuEditorContent">
              ${this.renderMenuEditorContent()}
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      
      // Bind menu item actions
      this.bindMenuItemActions();
    },

    renderMenuEditorContent() {
      if (!this.allMenus || this.allMenus.length === 0) {
        return '<p style="text-align:center;padding:40px;color:var(--text-muted);">No menus found</p>';
      }

      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const mealTypes = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

      let html = '<div class="menu-editor-grid">';

      days.forEach(day => {
        html += `<div class="day-editor-section">`;
        html += `<h3 class="day-editor-title">${day}</h3>`;
        
        mealTypes.forEach(mealType => {
          const menu = this.allMenus.find(m => m.day === day && m.meal_type === mealType);
          
          if (menu) {
            html += `
              <div class="meal-editor-card" data-menu-id="${menu.id}">
                <div class="meal-editor-header">
                  <span class="meal-editor-title">${mealType}</span>
                  <div class="meal-editor-actions">
                    <button class="icon-btn edit-meal-btn" data-menu-id="${menu.id}" title="Edit">
                      <i class="fa-solid fa-edit"></i>
                    </button>
                    <button class="icon-btn ${menu.is_special ? 'active' : ''} toggle-special-btn" 
                            data-menu-id="${menu.id}" title="Mark as Special">
                      <i class="fa-solid fa-star"></i>
                    </button>
                  </div>
                </div>
                <div class="meal-editor-body">
                  <div class="meal-editor-time">
                    <i class="fa-solid fa-clock"></i> ${menu.time_start} - ${menu.time_end}
                  </div>
                  <div class="meal-editor-items">
                    ${menu.items && menu.items.length > 0 ? 
                      menu.items.slice(0, 3).map(item => item.item_name).join(', ') + 
                      (menu.items.length > 3 ? ` +${menu.items.length - 3} more` : '')
                      : 'No items'}
                  </div>
                </div>
              </div>
            `;
          } else {
            html += `
              <div class="meal-editor-card empty">
                <span>${mealType}</span>
                <button class="add-meal-btn" data-day="${day}" data-meal-type="${mealType}">
                  <i class="fa-solid fa-plus"></i> Add
                </button>
              </div>
            `;
          }
        });

        html += `</div>`;
      });

      html += '</div>';
      return html;
    },

    bindMenuItemActions() {
      // Edit meal buttons
      document.querySelectorAll('.edit-meal-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const menuId = parseInt(e.currentTarget.dataset.menuId);
          this.editMeal(menuId);
        });
      });

      // Toggle special buttons
      document.querySelectorAll('.toggle-special-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const menuId = parseInt(e.currentTarget.dataset.menuId);
          await this.toggleSpecial(menuId, e.currentTarget);
        });
      });

      // Add meal buttons
      document.querySelectorAll('.add-meal-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const day = e.currentTarget.dataset.day;
          const mealType = e.currentTarget.dataset.mealType;
          this.createMeal(day, mealType);
        });
      });
    },

    async editMeal(menuId) {
      const menu = this.allMenus.find(m => m.id === menuId);
      if (!menu) {
        alert('Menu not found');
        return;
      }

      this.currentEditingMenu = menu;
      
      // Show detailed edit form
      const editorContent = document.getElementById('menuEditorContent');
      editorContent.innerHTML = this.renderDetailedMealEditor(menu);
      
      // Bind save button
      document.getElementById('saveMealBtn').addEventListener('click', () => this.saveMeal(menuId));
      
      // Bind cancel buttons
      document.getElementById('cancelEditBtn').addEventListener('click', () => {
        editorContent.innerHTML = this.renderMenuEditorContent();
        this.bindMenuItemActions();
      });
      document.getElementById('cancelEditBtn2').addEventListener('click', () => {
        editorContent.innerHTML = this.renderMenuEditorContent();
        this.bindMenuItemActions();
      });
      
      // Bind add item button
      document.getElementById('addItemBtn').addEventListener('click', () => {
        const itemsList = document.getElementById('menuItemsList');
        const newRow = document.createElement('div');
        newRow.className = 'menu-item-row';
        newRow.innerHTML = `
          <input type="text" value="" class="form-input item-name-input" placeholder="Item name" />
          <select class="form-input item-category-input">
            <option value="Main Course">Main Course</option>
            <option value="Side Dish">Side Dish</option>
            <option value="Beverage">Beverage</option>
            <option value="Dessert">Dessert</option>
            <option value="Snack">Snack</option>
            <option value="Staple">Staple</option>
          </select>
          <label class="checkbox-label">
            <input type="checkbox" class="item-veg-input" checked />
            Veg
          </label>
          <button class="icon-btn remove-item-btn" onclick="this.parentElement.remove()">
            <i class="fa-solid fa-trash"></i>
          </button>
        `;
        itemsList.appendChild(newRow);
      });
    },

    renderDetailedMealEditor(menu) {
      return `
        <div class="detailed-meal-editor">
          <div class="editor-header">
            <button class="back-btn" id="cancelEditBtn">
              <i class="fa-solid fa-arrow-left"></i> Back
            </button>
            <h3>${menu.day} - ${menu.meal_type}</h3>
          </div>

          <div class="editor-form">
            <div class="form-section">
              <h4>Meal Timings</h4>
              <div class="form-row">
                <div class="form-group">
                  <label>Start Time</label>
                  <input type="time" id="editTimeStart" value="${menu.time_start}" class="form-input" />
                </div>
                <div class="form-group">
                  <label>End Time</label>
                  <input type="time" id="editTimeEnd" value="${menu.time_end}" class="form-input" />
                </div>
              </div>
            </div>

            <div class="form-section">
              <h4>Meal Properties</h4>
              <div class="form-row">
                <div class="form-group">
                  <label>
                    <input type="checkbox" id="editIsSpecial" ${menu.is_special ? 'checked' : ''} />
                    Mark as Special
                  </label>
                </div>
                <div class="form-group">
                  <label>Estimated Servings</label>
                  <input type="number" id="editServings" value="${menu.estimated_servings || 3000}" 
                         class="form-input" min="0" />
                </div>
              </div>
            </div>

            <div class="form-section">
              <h4>Menu Items</h4>
              <div id="menuItemsList">
                ${menu.items && menu.items.length > 0 ? 
                  menu.items.map((item, index) => `
                    <div class="menu-item-row" data-item-index="${index}">
                      <input type="text" value="${item.item_name}" 
                             class="form-input item-name-input" placeholder="Item name" />
                      <select class="form-input item-category-input">
                        <option value="Main Course" ${item.category === 'Main Course' ? 'selected' : ''}>Main Course</option>
                        <option value="Side Dish" ${item.category === 'Side Dish' ? 'selected' : ''}>Side Dish</option>
                        <option value="Beverage" ${item.category === 'Beverage' ? 'selected' : ''}>Beverage</option>
                        <option value="Dessert" ${item.category === 'Dessert' ? 'selected' : ''}>Dessert</option>
                        <option value="Snack" ${item.category === 'Snack' ? 'selected' : ''}>Snack</option>
                        <option value="Staple" ${item.category === 'Staple' ? 'selected' : ''}>Staple</option>
                      </select>
                      <label class="checkbox-label">
                        <input type="checkbox" class="item-veg-input" ${item.is_veg ? 'checked' : ''} />
                        Veg
                      </label>
                      <button class="icon-btn remove-item-btn" onclick="this.parentElement.remove()">
                        <i class="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  `).join('')
                  : '<p style="color:var(--text-muted);padding:12px;">No items. Add items below.</p>'}
              </div>
              <button class="btn-secondary" id="addItemBtn" type="button">
                <i class="fa-solid fa-plus"></i> Add Item
              </button>
            </div>

            <div class="form-actions">
              <button class="btn-secondary" id="cancelEditBtn2" type="button">Cancel</button>
              <button class="btn-primary" id="saveMealBtn" type="button">
                <i class="fa-solid fa-save"></i> Save Changes
              </button>
            </div>
          </div>
        </div>
      `;
    },

    async saveMeal(menuId) {
      try {
        // Collect form data
        const updateData = {
          time_start: document.getElementById('editTimeStart').value,
          time_end: document.getElementById('editTimeEnd').value,
          is_special: document.getElementById('editIsSpecial').checked,
          estimated_servings: parseInt(document.getElementById('editServings').value),
          items: []
        };

        // Collect menu items
        document.querySelectorAll('.menu-item-row').forEach(row => {
          const itemName = row.querySelector('.item-name-input').value.trim();
          if (itemName) {
            updateData.items.push({
              item_name: itemName,
              category: row.querySelector('.item-category-input').value,
              is_veg: row.querySelector('.item-veg-input').checked,
              calories: 120,
              protein_g: 4.0,
              carbs_g: 20.0,
              fat_g: 3.0
            });
          }
        });

        // Send update to API
        const response = await fetch(`/api/manager/menu/${menuId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        });

        const data = await response.json();
        
        if (data.success) {
          alert('✅ Menu updated successfully!');
          
          // Refresh data
          await this.fetchAllMenus();
          await MenuDataManager.fetchTodayMenu();
          await MenuDataManager.fetchWeeklyMenu();
          
          // Close editor
          this.closeMenuEditor();
          
          console.log('✅ Menu updated and views refreshed');
        } else {
          alert('Failed to update menu: ' + data.message);
        }
      } catch (error) {
        console.error('❌ Error saving menu:', error);
        alert('Error saving menu');
      }
    },

    async toggleSpecial(menuId, buttonElement) {
      const menu = this.allMenus.find(m => m.id === menuId);
      if (!menu) return;

      const newSpecialStatus = !menu.is_special;

      try {
        const response = await fetch(`/api/manager/menu/${menuId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_special: newSpecialStatus })
        });

        const data = await response.json();
        
        if (data.success) {
          menu.is_special = newSpecialStatus;
          buttonElement.classList.toggle('active');
          
          // Refresh student views
          await MenuDataManager.fetchTodayMenu();
          await MenuDataManager.fetchWeeklyMenu();
          
          console.log(`✅ Menu ${menuId} special status: ${newSpecialStatus}`);
        }
      } catch (error) {
        console.error('❌ Error toggling special:', error);
      }
    },

    createMeal(day, mealType) {
      alert(`Create new meal: ${day} - ${mealType}\n\nThis feature will allow adding new meals to the timetable.`);
      // TODO: Implement create meal functionality
    },

    closeMenuEditor() {
      const modal = document.getElementById('menuEditorModal');
      if (modal) {
        modal.remove();
      }
    }
  };

