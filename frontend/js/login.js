/**
 * ============================================================
 * CampusPulse AI — Login Page JavaScript
 * File: frontend/js/login.js
 * 
 * Modules:
 * 1. Theme Manager (Dark/Light + localStorage persistence)
 * 2. Password Toggle (Show/Hide)
 * 3. Role Selector (4 roles)
 * 4. Form Validator (Email format, password length, empty checks)
 * 5. Login Handler (Button loading animation, form submission)
 * 6. Remember Me Manager (Save/restore credentials)
 * 7. Forgot Password Modal
 * 8. Initialization
 * ============================================================
 */

'use strict';


/* ============================================================
   1. THEME MANAGER
   Handles dark/light mode toggle with localStorage persistence.
   Syncs with dashboard theme using same key.
   ============================================================ */
const ThemeManager = (function () {
  const STORAGE_KEY = 'campuspulse_theme';
  const html = document.documentElement;
  const toggleBtn = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const themeLabel = document.getElementById('themeLabel');

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

    // Update icon and label
    if (themeIcon) {
      themeIcon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
    if (themeLabel) {
      themeLabel.textContent = isDark ? 'Light' : 'Dark';
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
   2. PASSWORD TOGGLE
   Show/Hide password with icon change and aria-label update.
   ============================================================ */
const PasswordToggle = (function () {
  const toggleBtn = document.getElementById('pwToggle');
  const passwordInput = document.getElementById('passwordInput');
  const toggleIcon = document.getElementById('pwToggleIcon');

  /**
   * Initialize password toggle
   */
  function init() {
    if (!toggleBtn || !passwordInput) return;

    toggleBtn.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';

      // Toggle input type
      passwordInput.type = isPassword ? 'text' : 'password';

      // Toggle icon
      if (toggleIcon) {
        toggleIcon.className = isPassword
          ? 'fa-solid fa-eye-slash'
          : 'fa-solid fa-eye';
      }

      // Update aria-label
      toggleBtn.setAttribute(
        'aria-label',
        isPassword ? 'Hide password' : 'Show password'
      );
    });
  }

  return { init };
})();


/* ============================================================
   3. ROLE SELECTOR
   Handles 4 role buttons: Student, Admin, Maintenance, Mess Manager.
   Saves selected role to localStorage and updates active state.
   ============================================================ */
const RoleSelector = (function () {
  const STORAGE_KEY = 'campuspulse_login_role';
  const roleButtons = document.querySelectorAll('.lp-role');
  let currentRole = localStorage.getItem(STORAGE_KEY) || 'student';

  /**
   * Set active role
   */
  function setRole(roleName) {
    currentRole = roleName;
    localStorage.setItem(STORAGE_KEY, roleName);

    // Update button states
    roleButtons.forEach((btn) => {
      const isActive = btn.dataset.role === roleName;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  /**
   * Get current role
   */
  function getRole() {
    return currentRole;
  }

  /**
   * Initialize role selector
   */
  function init() {
    if (roleButtons.length === 0) return;

    // Bind click handlers
    roleButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const role = btn.dataset.role;
        if (role) setRole(role);
      });
    });

    // Restore saved role
    setRole(currentRole);
  }

  return { init, getRole };
})();


/* ============================================================
   4. FORM VALIDATOR
   Validates email/ID and password fields.
   Returns validation result with error messages.
   ============================================================ */
const FormValidator = (function () {
  /**
   * Check if string is valid email format
   */
  function isValidEmail(value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  /**
   * Check if string is valid university ID format
   * Example: STU2024001, ADM001, etc.
   */
  function isValidUniversityId(value) {
    const idRegex = /^[A-Z]{2,4}\d{4,10}$/i;
    return idRegex.test(value);
  }

  /**
   * Validate email/ID field
   */
  function validateEmail(value, role) {
    const trimmed = value.trim();

    if (!trimmed) {
      return { valid: false, message: 'Email or University ID is required.' };
    }

    // Admins must use email format
    if (role === 'admin') {
      if (!isValidEmail(trimmed)) {
        return { valid: false, message: 'Please enter a valid email address.' };
      }
    } else {
      // Others can use email or university ID
      if (!isValidEmail(trimmed) && !isValidUniversityId(trimmed)) {
        return {
          valid: false,
          message: 'Please enter a valid email or university ID.',
        };
      }
    }

    return { valid: true, message: '' };
  }

  /**
   * Validate password field
   */
  function validatePassword(value) {
    if (!value) {
      return { valid: false, message: 'Password is required.' };
    }

    if (value.length < 6) {
      return {
        valid: false,
        message: 'Password must be at least 6 characters.',
      };
    }

    return { valid: true, message: '' };
  }

  /**
   * Validate entire form
   */
  function validateForm(email, password, role) {
    const emailResult = validateEmail(email, role);
    const passwordResult = validatePassword(password);

    return {
      valid: emailResult.valid && passwordResult.valid,
      errors: {
        email: emailResult.message,
        password: passwordResult.message,
      },
    };
  }

  return { validateForm };
})();


/* ============================================================
   5. LOGIN HANDLER
   Handles form submission, validation display, loading state,
   and simulates authentication.
   ============================================================ */
const LoginHandler = (function () {
  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('emailInput');
  const passwordInput = document.getElementById('passwordInput');
  const emailField = document.getElementById('emailField');
  const passwordField = document.getElementById('passwordField');
  const emailError = document.getElementById('emailErr');
  const passwordError = document.getElementById('passwordErr');
  const loginBtn = document.getElementById('loginBtn');
  const loginCard = document.getElementById('lpCard');

  let isSubmitting = false;

  /**
   * Show error message and add error styling
   */
  function showError(field, errorEl, message) {
    if (field) field.classList.add('is-error');
    if (errorEl) {
      errorEl.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${message}`;
      errorEl.classList.add('visible');
    }
  }

  /**
   * Clear error message and styling
   */
  function clearError(field, errorEl) {
    if (field) {
      field.classList.remove('is-error', 'is-success');
    }
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('visible');
    }
  }

  /**
   * Clear all errors
   */
  function clearAllErrors() {
    clearError(emailInput, emailError);
    clearError(passwordInput, passwordError);
  }

  /**
   * Show success styling on input
   */
  function showSuccess(field) {
    if (field) {
      field.classList.remove('is-error');
      field.classList.add('is-success');
    }
  }

  /**
   * Shake animation on card (for error feedback)
   */
  function shakeCard() {
    if (!loginCard) return;
    loginCard.classList.remove('lp-shake');
    void loginCard.offsetWidth; // Force reflow
    loginCard.classList.add('lp-shake');
    setTimeout(() => loginCard.classList.remove('lp-shake'), 500);
  }

  /**
   * Set button loading state
   */
  function setLoading(loading) {
    if (!loginBtn) return;

    if (loading) {
      loginBtn.classList.add('loading');
      loginBtn.disabled = true;
    } else {
      loginBtn.classList.remove('loading');
      loginBtn.disabled = false;
    }
  }

  /**
   * Simulate authentication API call
   * In production, replace with actual API endpoint
   */
  function authenticateUser(email, password, role) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Demo credentials (remove in production)
        const demoCredentials = {
          student: { id: 'STU2024001', password: 'student123' },
          admin: { id: 'admin@campus.edu', password: 'admin123' },
          maintenance: { id: 'MNT001', password: 'maint123' },
          mess: { id: 'MESS001', password: 'mess123' },
        };

        const demo = demoCredentials[role];
        const emailLower = email.toLowerCase();
        const demoIdLower = demo ? demo.id.toLowerCase() : '';

        if (demo && emailLower === demoIdLower && password === demo.password) {
          resolve({ success: true, user: { email, role } });
        } else if (email.endsWith('@university.edu') && password.length >= 6) {
          // Accept any @university.edu email for demo
          resolve({ success: true, user: { email, role } });
        } else {
          reject(new Error('Invalid credentials. Please try again.'));
        }
      }, 1600);
    });
  }

  /**
   * Handle form submission
   */
  function handleSubmit(e) {
    e.preventDefault();

    if (isSubmitting) return;

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const role = RoleSelector.getRole();

    // Clear previous errors
    clearAllErrors();

    // Validate form
    const validation = FormValidator.validateForm(email, password, role);

    if (!validation.valid) {
      // Show validation errors
      if (validation.errors.email) {
        showError(emailInput, emailError, validation.errors.email);
      }
      if (validation.errors.password) {
        showError(passwordInput, passwordError, validation.errors.password);
      }
      shakeCard();
      return;
    }

    // All valid — show success state
    showSuccess(emailInput);
    showSuccess(passwordInput);

    // Start loading
    isSubmitting = true;
    setLoading(true);

    // Attempt authentication
    authenticateUser(email, password, role)
      .then((response) => {
        // Success — save remember me and redirect
        RememberManager.save(email, role);

        // Redirect to dashboard (adjust path as needed)
        window.location.href = 'dashboard.html';
      })
      .catch((error) => {
        // Authentication failed
        isSubmitting = false;
        setLoading(false);

        showError(emailInput, emailError, 'Invalid credentials.');
        showError(
          passwordInput,
          passwordError,
          error.message || 'Authentication failed.'
        );
        shakeCard();
      });
  }

  /**
   * Live validation — clear errors on input
   */
  function setupLiveValidation() {
    if (emailInput) {
      emailInput.addEventListener('input', () => {
        clearError(emailInput, emailError);
      });
    }

    if (passwordInput) {
      passwordInput.addEventListener('input', () => {
        clearError(passwordInput, passwordError);
      });
    }
  }

  /**
   * Initialize login handler
   */
  function init() {
    if (form) {
      form.addEventListener('submit', handleSubmit);
    }

    setupLiveValidation();
  }

  return { init };
})();


/* ============================================================
   6. REMEMBER ME MANAGER
   Saves and restores email + role when "Remember me" is checked.
   ============================================================ */
const RememberManager = (function () {
  const EMAIL_KEY = 'campuspulse_rem_email';
  const ROLE_KEY = 'campuspulse_rem_role';
  const FLAG_KEY = 'campuspulse_rem_flag';

  const rememberCheckbox = document.getElementById('rememberMe');
  const emailInput = document.getElementById('emailInput');

  /**
   * Save credentials to localStorage
   */
  function save(email, role) {
    if (rememberCheckbox && rememberCheckbox.checked) {
      localStorage.setItem(EMAIL_KEY, email);
      localStorage.setItem(ROLE_KEY, role);
      localStorage.setItem(FLAG_KEY, 'true');
    } else {
      // Clear saved credentials
      localStorage.removeItem(EMAIL_KEY);
      localStorage.removeItem(ROLE_KEY);
      localStorage.removeItem(FLAG_KEY);
    }
  }

  /**
   * Restore saved credentials on page load
   */
  function restore() {
    if (localStorage.getItem(FLAG_KEY) !== 'true') return;

    const savedEmail = localStorage.getItem(EMAIL_KEY);
    const savedRole = localStorage.getItem(ROLE_KEY);

    if (emailInput && savedEmail) {
      emailInput.value = savedEmail;
    }

    if (rememberCheckbox) {
      rememberCheckbox.checked = true;
    }

    // Role is restored by RoleSelector using its own key
  }

  /**
   * Initialize remember me manager
   */
  function init() {
    restore();
  }

  return { init, save };
})();


/* ============================================================
   7. FORGOT PASSWORD MODAL
   Handles modal open/close and reset link simulation.
   ============================================================ */
const ForgotPasswordModal = (function () {
  const modal = document.getElementById('forgotModal');
  const modalCard = document.getElementById('forgotModalCard');
  const openLink = document.getElementById('forgotLink');
  const closeBtn = document.getElementById('forgotClose');
  const resetBtn = document.getElementById('resetBtn');
  const resetInput = document.getElementById('resetInput');
  const resetError = document.getElementById('resetErr');
  const resetSuccess = document.getElementById('resetSuccess');

  /**
   * Open modal
   */
  function open() {
    if (!modal) return;

    modal.hidden = false;
    requestAnimationFrame(() => {
      modal.classList.add('open');
    });

    // Focus input
    if (resetInput) {
      setTimeout(() => resetInput.focus(), 100);
    }
  }

  /**
   * Close modal
   */
  function close() {
    if (!modal) return;

    modal.classList.remove('open');

    setTimeout(() => {
      modal.hidden = true;

      // Reset modal state
      if (resetInput) resetInput.value = '';
      if (resetError) {
        resetError.textContent = '';
        resetError.classList.remove('visible');
      }
      if (resetSuccess) resetSuccess.hidden = true;
      if (resetBtn) {
        resetBtn.classList.remove('loading');
        resetBtn.disabled = false;
      }
    }, 300);
  }

  /**
   * Handle reset link submission
   */
  function handleReset() {
    const value = resetInput ? resetInput.value.trim() : '';

    // Validation
    if (!value) {
      if (resetError) {
        resetError.innerHTML =
          '<i class="fa-solid fa-circle-exclamation"></i> Please enter your email or ID.';
        resetError.classList.add('visible');
      }
      return;
    }

    // Clear error
    if (resetError) {
      resetError.textContent = '';
      resetError.classList.remove('visible');
    }

    // Show loading
    if (resetBtn) {
      resetBtn.classList.add('loading');
      resetBtn.disabled = true;
    }

    // Simulate API call
    setTimeout(() => {
      if (resetBtn) {
        resetBtn.classList.remove('loading');
        resetBtn.disabled = false;
      }

      // Show success
      if (resetSuccess) {
        resetSuccess.hidden = false;
      }

      // Auto-close after 2.5s
      setTimeout(close, 2500);
    }, 1800);
  }

  /**
   * Initialize forgot password modal
   */
  function init() {
    // Bind open link
    if (openLink) {
      openLink.addEventListener('click', (e) => {
        e.preventDefault();
        open();
      });
    }

    // Bind close button
    if (closeBtn) {
      closeBtn.addEventListener('click', close);
    }

    // Bind reset button
    if (resetBtn) {
      resetBtn.addEventListener('click', handleReset);
    }

    // Close on overlay click
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) close();
      });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && !modal.hidden) {
        close();
      }
    });

    // Submit on Enter in input
    if (resetInput) {
      resetInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleReset();
      });
    }
  }

  return { init };
})();


/* ============================================================
   8. INITIALIZATION
   Initialize all modules when DOM is ready.
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  PasswordToggle.init();
  RoleSelector.init();
  LoginHandler.init();
  RememberManager.init();
  ForgotPasswordModal.init();

  console.log('✓ CampusPulse AI Login — All modules initialized');
});


/* ============================================================
   END OF login.js
   ============================================================ */