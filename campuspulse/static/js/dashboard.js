/**
 * CampusPulse AI - Dashboard JavaScript
 */

function showComingSoon(event, moduleName) {
  event.preventDefault();
  
  const modal = document.getElementById('comingSoonModal');
  const title = document.getElementById('modalTitle');
  
  title.textContent = `${moduleName} - Coming in Next Sprint`;
  modal.classList.add('show');
}

function closeModal() {
  const modal = document.getElementById('comingSoonModal');
  modal.classList.remove('show');
}

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('comingSoonModal');
  
  modal.addEventListener('click', function(event) {
    if (event.target === modal) {
      closeModal();
    }
  });
  
  // Keyboard navigation
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      closeModal();
    }
  });
});
