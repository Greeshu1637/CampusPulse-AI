/**
 * Smart Dining - Student View JavaScript
 */

let currentMealForFeedback = null;

// Load today's menu on page load
document.addEventListener('DOMContentLoaded', function() {
    loadTodayMenu();
    loadMealHistory();
});

/**
 * Load today's menu
 */
async function loadTodayMenu() {
    const menuGrid = document.getElementById('menu-grid');
    
    try {
        const response = await fetch('/dining/api/menu/today');
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
            renderMenuCards(result.data);
        } else {
            menuGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-state-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20"/>
                            <path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3z"/>
                        </svg>
                    </div>
                    <h3 class="empty-state-title">No menu available</h3>
                    <p class="empty-state-description">Today's menu has not been created yet. Check back later.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading menu:', error);
        menuGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-state-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                </div>
                <h3 class="empty-state-title">Error loading menu</h3>
                <p class="empty-state-description">Unable to load today's menu. Please try again later.</p>
            </div>
        `;
    }
}

/**
 * Render menu cards
 */
function renderMenuCards(menus) {
    const menuGrid = document.getElementById('menu-grid');
    
    menuGrid.innerHTML = menus.map(menu => `
        <div class="meal-card">
            <div class="meal-card-header">
                <div class="meal-type-badge ${menu.meal_type}">${menu.meal_type}</div>
            </div>
            
            <div class="meal-menu-items">${menu.menu_items}</div>
            
            ${menu.description ? `<div class="meal-description">${menu.description}</div>` : ''}
            
            <div class="meal-stats">
                ${menu.calories ? `
                    <div class="meal-stat">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                        <span>${menu.calories} cal</span>
                    </div>
                ` : ''}
                <div class="meal-stat">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <span>${menu.attendance_count} served</span>
                </div>
            </div>
            
            <div class="meal-actions">
                <button class="btn btn-primary btn-sm" onclick="markAttendance(${menu.id})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Mark Taken
                </button>
                <button class="btn btn-secondary btn-sm" onclick="openFeedbackModal(${menu.id}, '${menu.meal_type}', '${menu.menu_items}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    Rate Meal
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * Mark meal attendance
 */
async function markAttendance(mealId) {
    try {
        const response = await fetch('/dining/api/attendance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ meal_menu_id: mealId })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Attendance marked successfully!', 'success');
            loadTodayMenu(); // Reload to show updated count
            loadMealHistory(); // Reload history
        } else {
            showNotification(result.error || 'Failed to mark attendance', 'error');
        }
    } catch (error) {
        console.error('Error marking attendance:', error);
        showNotification('Failed to mark attendance', 'error');
    }
}

/**
 * Open feedback modal
 */
function openFeedbackModal(mealId, mealType, menuItems) {
    currentMealForFeedback = mealId;
    
    document.getElementById('feedback-meal-id').value = mealId;
    document.getElementById('feedback-meal-type').textContent = mealType;
    document.getElementById('feedback-meal-type').className = `meal-type-badge ${mealType}`;
    document.getElementById('feedback-menu-items').textContent = menuItems;
    document.getElementById('feedback-rating').value = '0';
    document.getElementById('feedback-text').value = '';
    
    // Reset stars
    document.querySelectorAll('.star').forEach(star => star.classList.remove('active'));
    
    document.getElementById('feedbackModal').classList.add('active');
}

/**
 * Close feedback modal
 */
function closeFeedbackModal() {
    document.getElementById('feedbackModal').classList.remove('active');
    currentMealForFeedback = null;
}

/**
 * Star rating interaction
 */
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.star').forEach(star => {
        star.addEventListener('click', function() {
            const rating = this.getAttribute('data-rating');
            document.getElementById('feedback-rating').value = rating;
            
            // Update star display
            document.querySelectorAll('.star').forEach((s, index) => {
                if (index < rating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });
});

/**
 * Submit feedback
 */
async function submitFeedback() {
    const mealId = document.getElementById('feedback-meal-id').value;
    const rating = parseInt(document.getElementById('feedback-rating').value);
    const feedbackText = document.getElementById('feedback-text').value;
    
    if (!rating || rating < 1 || rating > 5) {
        showNotification('Please select a rating', 'error');
        return;
    }
    
    try {
        const response = await fetch('/dining/api/feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                meal_menu_id: parseInt(mealId),
                rating: rating,
                feedback_text: feedbackText || null
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Feedback submitted successfully!', 'success');
            closeFeedbackModal();
            loadMealHistory(); // Reload history
        } else {
            showNotification(result.error || 'Failed to submit feedback', 'error');
        }
    } catch (error) {
        console.error('Error submitting feedback:', error);
        showNotification('Failed to submit feedback', 'error');
    }
}

/**
 * Load meal history
 */
async function loadMealHistory() {
    const historyList = document.getElementById('history-list');
    
    try {
        const response = await fetch('/dining/api/history?limit=10');
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
            historyList.innerHTML = result.data.map(item => `
                <div class="history-item">
                    <div class="history-header">
                        <span class="history-date">${formatDate(item.meal_date)}</span>
                        <div class="meal-type-badge ${item.meal_type}">${item.meal_type}</div>
                    </div>
                    <div class="history-menu">${item.menu_items}</div>
                    ${item.rating ? `
                        <div class="history-feedback">
                            <div class="history-stars">
                                ${renderStars(item.rating)}
                            </div>
                            ${item.feedback_text ? `<span class="history-text">"${item.feedback_text}"</span>` : ''}
                        </div>
                    ` : '<span class="text-muted">No feedback provided</span>'}
                </div>
            `).join('');
        } else {
            historyList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                        </svg>
                    </div>
                    <h3 class="empty-state-title">No meal history</h3>
                    <p class="empty-state-description">Your meal history will appear here once you start marking attendance.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading history:', error);
        historyList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                </div>
                <h3 class="empty-state-title">Error loading history</h3>
                <p class="empty-state-description">Unable to load your meal history.</p>
            </div>
        `;
    }
}

/**
 * Render stars for rating
 */
function renderStars(rating) {
    return Array(5).fill(0).map((_, i) => `
        <svg viewBox="0 0 24 24" fill="${i < rating ? '#F59E0B' : 'none'}" stroke="${i < rating ? '#F59E0B' : 'currentColor'}" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
    `).join('');
}

/**
 * Format date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    // Simple alert for now - can be enhanced with toast notifications
    alert(message);
}
