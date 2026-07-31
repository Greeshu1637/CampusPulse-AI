/**
 * CampusPulse AI - Login Page JavaScript
 */

function selectRole(role) {
  // Add visual feedback
  event.currentTarget.style.opacity = '0.7';
  event.currentTarget.style.transform = 'scale(0.95)';
  
  // Redirect to role selection route
  setTimeout(() => {
    window.location.href = `/select-role/${role}`;
  }, 150);
}
