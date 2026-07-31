/**
 * Smart Dining - Manager View JavaScript
 */

let editingMenuId = null;

// Load today's menu on page load
document.addEventListener('DOMContentLoaded', function() {
    loadTodayMenu();
    setTodayDate();
});

/**
 * Set today's date as default in date picker
 */
function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('menu-date').value = today;
}

/**
 * Load today's menu
 */
async function loadTodayMenu() {
    const menuGrid = document.getElementById('menu-grid');
    
    try {
        const response = await fetch('/dining/api/menu/today');
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
            renderManagerMenuCards(result.data);
        } else {
            menuGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-state-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20"/>
                            <path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3z"/>
                        </svg>
                    </div>
                    <h3 class="empty-state-title">No menu created</h3>
                    <p class="empty-state-description">Create today's menu to get started.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading menu:', error);
        showNotification('Error loading menu', 'error');
    }
}

/**
 * Render manager menu cards
 */
function renderManagerMenuCards(menus) {
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
                <div class="meal-stat">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    <span>${menu.food_waste_kg} kg waste</span>
                </div>
            </div>
            
            <div class="manager-actions">
                <button class="btn btn-secondary btn-sm" onclick="editMenu(${menu.id})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit
                </button>
                <button class="btn btn-secondary btn-sm" onclick="showWasteModal(${menu.id}, '${menu.meal_type}', '${menu.menu_items}', ${menu.food_waste_kg})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    Waste
                </button>
                <button class="btn btn-secondary btn-sm" onclick="deleteMenu(${menu.id})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * Show create menu modal
 */
function showCreateMenuModal() {
    editingMenuId = null;
    document.getElementById('menu-modal-title').textContent = 'Create Menu';
    document.getElementById('menu-edit-id').value = '';
    
    // Reset form
    setTodayDate();
    document.getElementById('menu-type').value = '';
    document.getElementById('menu-items').value = '';
    document.getElementById('menu-description').value = '';
    document.getElementById('menu-calories').value = '';
    
    document.getElementById('menuModal').classList.add('active');
}

/**
 * Edit menu
 */
async function editMenu(menuId) {
    try {
        const response = await fetch(`/dining/api/menu/today`);
        const result = await response.json();
        
        if (result.success) {
            const menu = result.data.find(m => m.id === menuId);
            
            if (menu) {
                editingMenuId = menuId;
                document.getElementById('menu-modal-title').textContent = 'Edit Menu';
                document.getElementById('menu-edit-id').value = menuId;
                document.getElementById('menu-date').value = menu.meal_date;
                document.getElementById('menu-type').value = menu.meal_type;
                document.getElementById('menu-items').value = menu.menu_items;
                document.getElementById('menu-description').value = menu.description || '';
                document.getElementById('menu-calories').value = menu.calories || '';
                
                document.getElementById('menuModal').classList.add('active');
            }
        }
    } catch (error) {
        console.error('Error loading menu for edit:', error);
        showNotification('Error loading menu', 'error');
    }
}

/**
 * Close menu modal
 */
function closeMenuModal() {
    document.getElementById('menuModal').classList.remove('active');
    editingMenuId = null;
}

/**
 * Save menu (create or update)
 */
async function saveMenu() {
    const menuId = document.getElementById('menu-edit-id').value;
    const mealDate = document.getElementById('menu-date').value;
    const mealType = document.getElementById('menu-type').value;
    const menuItems = document.getElementById('menu-items').value;
    const description = document.getElementById('menu-description').value;
    const calories = document.getElementById('menu-calories').value;
    
    // Validation
    if (!mealDate || !mealType || !menuItems) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    const data = {
        meal_date: mealDate,
        meal_type: mealType,
        menu_items: menuItems,
        description: description || null,
        calories: calories ? parseInt(calories) : null
    };
    
    try {
        let response;
        
        if (menuId) {
            // Update existing menu
            response = await fetch(`/dining/api/menu/${menuId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        } else {
            // Create new menu
            response = await fetch('/dining/api/menu', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        }
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(menuId ? 'Menu updated successfully!' : 'Menu created successfully!', 'success');
            closeMenuModal();
            loadTodayMenu();
        } else {
            showNotification(result.error || 'Failed to save menu', 'error');
        }
    } catch (error) {
        console.error('Error saving menu:', error);
        showNotification('Failed to save menu', 'error');
    }
}

/**
 * Delete menu
 */
async function deleteMenu(menuId) {
    if (!confirm('Are you sure you want to delete this menu? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`/dining/api/menu/${menuId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Menu deleted successfully!', 'success');
            loadTodayMenu();
        } else {
            showNotification(result.error || 'Failed to delete menu', 'error');
        }
    } catch (error) {
        console.error('Error deleting menu:', error);
        showNotification('Failed to delete menu', 'error');
    }
}

/**
 * Show waste modal
 */
function showWasteModal(menuId, mealType, menuItems, currentWaste) {
    document.getElementById('waste-menu-id').value = menuId;
    document.getElementById('waste-meal-type').textContent = mealType;
    document.getElementById('waste-meal-type').className = `meal-type-badge ${mealType}`;
    document.getElementById('waste-menu-items').textContent = menuItems;
    document.getElementById('waste-kg').value = currentWaste;
    
    document.getElementById('wasteModal').classList.add('active');
}

/**
 * Close waste modal
 */
function closeWasteModal() {
    document.getElementById('wasteModal').classList.remove('active');
}

/**
 * Save waste
 */
async function saveWaste() {
    const menuId = document.getElementById('waste-menu-id').value;
    const wasteKg = document.getElementById('waste-kg').value;
    
    if (!wasteKg || parseFloat(wasteKg) < 0) {
        showNotification('Please enter a valid waste amount', 'error');
        return;
    }
    
    try {
        const response = await fetch(`/dining/api/waste/${menuId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                food_waste_kg: parseFloat(wasteKg)
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Food waste updated successfully!', 'success');
            closeWasteModal();
            loadTodayMenu();
        } else {
            showNotification(result.error || 'Failed to update waste', 'error');
        }
    } catch (error) {
        console.error('Error updating waste:', error);
        showNotification('Failed to update waste', 'error');
    }
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    alert(message);
}
