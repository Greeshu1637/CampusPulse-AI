/* ============================================================
   CampusPulse AI – Analytics Dashboard JavaScript
   Handles filters, data visualization, and interactions
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
      setInterval(() => this.updateDate(), 60000);
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
  // FILTER MANAGER
  // ============================================================
  const FilterManager = {
    init() {
      this.filters = {
        timeRange: 'week',
        department: '',
        category: '',
        metric: ''
      };

      this.bindFilterEvents();
      this.bindClearFilters();
    },

    bindFilterEvents() {
      const filterElements = {
        timeRange: document.getElementById('filterTimeRange'),
        department: document.getElementById('filterDepartment'),
        category: document.getElementById('filterCategory'),
        metric: document.getElementById('filterMetric')
      };

      Object.entries(filterElements).forEach(([key, element]) => {
        if (element) {
          element.addEventListener('change', (e) => {
            this.updateFilter(key, e.target.value);
          });
        }
      });
    },

    bindClearFilters() {
      const clearBtn = document.getElementById('clearFiltersBtn');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => this.clearAllFilters());
      }
    },

    updateFilter(key, value) {
      this.filters[key] = value;
      console.log(`Filter updated: ${key} = ${value}`);
      this.applyFilters();
    },

    clearAllFilters() {
      // Reset to defaults
      this.filters = {
        timeRange: 'week',
        department: '',
        category: '',
        metric: ''
      };

      // Reset UI
      const filterElements = {
        timeRange: document.getElementById('filterTimeRange'),
        department: document.getElementById('filterDepartment'),
        category: document.getElementById('filterCategory'),
        metric: document.getElementById('filterMetric')
      };

      Object.entries(filterElements).forEach(([key, element]) => {
        if (element) {
          element.value = this.filters[key];
        }
      });

      this.applyFilters();
      this.showNotification('All filters cleared');
    },

    applyFilters() {
      // Animate cards on filter change
      const cards = document.querySelectorAll('.chart-card, .kpi-card, .insight-card');
      cards.forEach((card, index) => {
        card.style.animation = 'none';
        setTimeout(() => {
          card.style.animation = `fadeInUp 0.4s ease ${index * 0.05}s backwards`;
        }, 10);
      });

      console.log('Filters applied:', this.filters);
    },

    showNotification(message) {
      // Create temporary notification
      const notif = document.createElement('div');
      notif.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: var(--accent-purple);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 0.85rem;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
      `;
      notif.textContent = message;
      document.body.appendChild(notif);

      setTimeout(() => {
        notif.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notif.remove(), 300);
      }, 2000);
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
      const searchableElements = document.querySelectorAll('.chart-card, .insight-card, .kpi-card');

      let visibleCount = 0;

      searchableElements.forEach(element => {
        const text = element.textContent.toLowerCase();
        const matches = text.includes(lowerQuery);
        
        element.style.display = matches ? '' : 'none';
        
        if (matches) {
          visibleCount++;
          element.style.animation = 'fadeInUp 0.3s ease';
        }
      });

      console.log(`Search: "${query}" - ${visibleCount} results found`);
    },

    clearSearch() {
      const searchableElements = document.querySelectorAll('.chart-card, .insight-card, .kpi-card');
      searchableElements.forEach(element => {
        element.style.display = '';
      });
    }
  };

  // ============================================================
  // EXPORT MANAGER
  // ============================================================
  const ExportManager = {
    init() {
      this.bindExportButton();
    },

    bindExportButton() {
      const exportBtn = document.getElementById('exportReportBtn');
      if (exportBtn) {
        exportBtn.addEventListener('click', () => this.exportReport());
      }
    },

    exportReport() {
      // Simulate export process
      const btn = document.getElementById('exportReportBtn');
      const originalHTML = btn.innerHTML;

      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Exporting...';
      btn.disabled = true;

      setTimeout(() => {
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Exported!';
        
        setTimeout(() => {
          btn.innerHTML = originalHTML;
          btn.disabled = false;
          this.downloadReport();
        }, 1000);
      }, 2000);
    },

    downloadReport() {
      // Generate report data
      const reportData = {
        title: 'CampusPulse AI - Analytics Report',
        generatedAt: new Date().toISOString(),
        timeRange: FilterManager.filters.timeRange,
        filters: FilterManager.filters,
        summary: {
          totalStudents: 12847,
          avgAttendance: '94.2%',
          openComplaints: 47,
          roomUtilization: '78%',
          foodRating: 4.6
        }
      };

      // Create downloadable file
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('Report downloaded:', reportData);
    }
  };

  // ============================================================
  // SPARKLINE ANIMATOR
  // ============================================================
  const SparklineAnimator = {
    init() {
      this.animateSparklines();
    },

    animateSparklines() {
      const sparklines = document.querySelectorAll('.kpi-sparkline');
      
      sparklines.forEach((sparkline, index) => {
        // Generate random sparkline data for demo
        const points = 12;
        const data = Array.from({ length: points }, () => Math.random() * 100);
        
        // Create SVG sparkline
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.setAttribute('viewBox', '0 0 100 30');
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';

        // Create path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const pathData = this.generatePath(data);
        path.setAttribute('d', pathData);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', 'var(--accent-purple)');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('opacity', '0.6');
        
        svg.appendChild(path);
        sparkline.innerHTML = '';
        sparkline.appendChild(svg);

        // Animate path
        const length = path.getTotalLength();
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;
        
        setTimeout(() => {
          path.style.transition = 'stroke-dashoffset 1s ease';
          path.style.strokeDashoffset = '0';
        }, index * 100);
      });
    },

    generatePath(data) {
      const width = 100;
      const height = 30;
      const max = Math.max(...data);
      const min = Math.min(...data);
      const range = max - min || 1;

      let path = '';
      data.forEach((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * (height - 4) - 2;
        path += index === 0 ? `M${x},${y}` : ` L${x},${y}`;
      });

      return path;
    }
  };

  // ============================================================
  // HEATMAP INTERACTIVITY
  // ============================================================
  const HeatmapManager = {
    init() {
      this.bindHeatmapCells();
    },

    bindHeatmapCells() {
      const cells = document.querySelectorAll('.heatmap-cell');
      
      cells.forEach(cell => {
        cell.addEventListener('click', () => {
          const title = cell.getAttribute('title');
          if (title) {
            alert(`Classroom Utilization:\n${title}`);
          }
        });
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

      const animatedElements = document.querySelectorAll('.chart-card, .insight-card, .kpi-card');
      animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = `all 0.6s ease ${index * 0.05}s`;
        observer.observe(el);
      });
    }
  };

  // ============================================================
  // TAB SWITCHER
  // ============================================================
  const TabSwitcher = {
    init() {
      this.bindTabButtons();
    },

    bindTabButtons() {
      const tabButtons = document.querySelectorAll('.tab-btn');
      
      tabButtons.forEach(button => {
        button.addEventListener('click', () => {
          // Remove active from siblings
          const siblings = button.parentElement.querySelectorAll('.tab-btn');
          siblings.forEach(sib => sib.classList.remove('active'));
          
          // Add active to clicked
          button.classList.add('active');
          
          console.log('Tab switched:', button.textContent.trim());
        });
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
    FilterManager.init();
    SearchManager.init();
    ExportManager.init();
    SparklineAnimator.init();
    HeatmapManager.init();
    RippleEffect.init();
    ScrollAnimations.init();
    TabSwitcher.init();

    console.log('📊 CampusPulse Analytics Dashboard initialized successfully!');
  });

})();
