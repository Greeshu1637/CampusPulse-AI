/**
 * CampusPulse AI - Theme Management
 * Handles Light/Dark/System theme switching
 */

// Theme Management
const ThemeManager = {
  init() {
    this.loadTheme();
    this.attachEventListeners();
  },

  loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    this.applyTheme(savedTheme);
    this.updateActiveButton(savedTheme);
  },

  applyTheme(theme) {
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    localStorage.setItem('theme', theme);
  },

  updateActiveButton(theme) {
    document.querySelectorAll('.theme-option').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.theme === theme) {
        btn.classList.add('active');
      }
    });
  },

  attachEventListeners() {
    document.querySelectorAll('.theme-option').forEach(button => {
      button.addEventListener('click', () => {
        const theme = button.dataset.theme;
        this.applyTheme(theme);
        this.updateActiveButton(theme);
      });
    });

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (localStorage.getItem('theme') === 'system') {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    });
  }
};

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
});
