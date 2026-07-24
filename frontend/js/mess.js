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
  document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    SidebarManager.init();
    TopbarManager.init();
    ViewSwitcher.init();
    SearchManager.init();
    RatingManager.init();
    MealStatusUpdater.init();
    RippleEffect.init();
    ScrollAnimations.init();

    console.log('🍽️ CampusPulse Mess Management initialized successfully!');
  });

})();
