/**
 * CampusPulse AI – Complaints Module JavaScript
 * Sprint 3A: Basic Data Loading Only
 */

'use strict';

/* ============================================================
   CONSTANTS
   ============================================================ */
const API_BASE = 'http://127.0.0.1:5000/api';

/* ============================================================
   COMPLAINTS MANAGER
   ============================================================ */
const ComplaintsManager = {
  complaints: [],
  allComplaints: [],
  stats: null,
  categories: [],
  
  // Filters
  filters: {
    status: '',
    category_id: '',
    priority: '',
    hostel_block: '',
    search: ''
  },
  
  // Pagination
  currentPage: 0,
  complaintsPerPage: 10,

  /**
   * Initialize Complaints Manager
   */
  async init() {
    console.log('📋 Initializing Complaints Manager...');
    
    // Load data
    await this.loadCategories();
    await this.loadStats();
    await this.loadComplaints();
    
    // Bind events
    this.bindFilterEvents();
    
    console.log('✅ Complaints Manager initialized');
  },

  /**
   * Load categories from API
   */
  async loadCategories() {
    try {
      const response = await fetch(`${API_BASE}/complaints/categories`);
      const data = await response.json();
      
      if (data.success) {
        this.categories = data.categories;
        console.log('✅ Loaded', data.count, 'categories');
        this.populateCategoryDropdown();
      }
    } catch (error) {
      console.error('❌ Error loading categories:', error);
    }
  },

  /**
   * Load statistics from API
   */
  async loadStats() {

    try {
      const response = await fetch(`${API_BASE}/complaints/stats`);
      const data = await response.json();
      
      if (data.success) {
        this.stats = data.stats;
        console.log('✅ Loaded statistics');
        this.renderStats();
      }
    } catch (error) {
      console.error('❌ Error loading stats:', error);
    }
  },

  /**
   * Load complaints from API
   */
  async loadComplaints() {
    try {
      this.showLoading();
      
      // Build query params
      const params = new URLSearchParams();
      if (this.filters.status) params.append('status', this.filters.status);
      if (this.filters.category_id) params.append('category_id', this.filters.category_id);
      if (this.filters.priority) params.append('priority', this.filters.priority);
      if (this.filters.hostel_block) params.append('hostel_block', this.filters.hostel_block);
      
      const response = await fetch(`${API_BASE}/complaints?${params}`);
      const data = await response.json();
      
      if (data.success) {
        this.allComplaints = data.complaints;
        this.applySearchFilter();
        console.log('✅ Loaded', data.total, 'complaints');
      } else {
        this.showError('Failed to load complaints');
      }
    } catch (error) {
      console.error('❌ Error loading complaints:', error);
      this.showError('Failed to load complaints. Please try again.');
    }
  },
  
  /**
   * Apply search filter locally
   */
  applySearchFilter() {
    const search = this.filters.search.toLowerCase().trim();
    
    if (!search) {
      this.complaints = this.allComplaints;
    } else {
      this.complaints = this.allComplaints.filter(complaint => {
        return complaint.complaint_id.toLowerCase().includes(search) ||
               complaint.title.toLowerCase().includes(search) ||
               complaint.description.toLowerCase().includes(search) ||
               (complaint.category && complaint.category.name.toLowerCase().includes(search)) ||
               (complaint.hostel_block && complaint.hostel_block.toLowerCase().includes(search));
      });
    }
    
    this.currentPage = 0;
    this.renderComplaints();
  },
  
  /**
   * Populate category dropdown
   */
  populateCategoryDropdown() {
    const select = document.getElementById('filterCategory');
    if (!select) return;
    
    // Clear and add default option
    select.innerHTML = '<option value="">All Categories</option>';
    
    // Add categories from API
    this.categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = category.name;
      select.appendChild(option);
    });
    
    console.log('✅ Category dropdown populated');
  },

  /**
   * Render statistics
   */
  renderStats() {
    if (!this.stats) return;
    
    const kpiCards = document.querySelectorAll('.kpi-card');
    if (kpiCards.length < 4) return;
    
    // Total Complaints
    const totalValue = kpiCards[0].querySelector('.kpi-value');
    if (totalValue) totalValue.textContent = this.stats.total;
    
    // Open Complaints
    const openValue = kpiCards[1].querySelector('.kpi-value');
    if (openValue) openValue.textContent = this.stats.by_status.open || 0;
    
    // In Progress
    const inProgressValue = kpiCards[2].querySelector('.kpi-value');
    if (inProgressValue) inProgressValue.textContent = this.stats.by_status.in_progress || 0;
    
    // Resolved Complaints
    const resolvedValue = kpiCards[3].querySelector('.kpi-value');
    if (resolvedValue) resolvedValue.textContent = this.stats.by_status.resolved || 0;
    
    // Update resolution rate
    const resolutionRate = this.stats.resolution_rate || 0;
    const rateText = kpiCards[3].querySelector('.kpi-card > div:last-child > div:last-child');
    if (rateText) rateText.textContent = `${resolutionRate.toFixed(0)}% resolution rate`;
    
    console.log('✅ Statistics rendered');
  },

  /**
   * Render complaints
   */
  renderComplaints() {
    const container = document.querySelector('.page-wrapper > section:last-child > div:last-child');
    if (!container) return;
    
    const complaints = this.complaints;
    
    // Check if no complaints
    if (complaints.length === 0) {
      this.showEmpty();
      return;
    }
    
    // Calculate pagination
    const start = this.currentPage * this.complaintsPerPage;
    const end = start + this.complaintsPerPage;
    const pageComplaints = complaints.slice(start, end);
    const hasMore = end < complaints.length;
    
    // Clear container
    container.innerHTML = '';
    
    // Render complaint cards
    pageComplaints.forEach(complaint => {
      container.appendChild(this.createComplaintCard(complaint));
    });
    
    // Add pagination info and Load More button
    if (complaints.length > this.complaintsPerPage) {
      const paginationDiv = document.createElement('div');
      paginationDiv.style.cssText = 'grid-column:1/-1;text-align:center;padding:20px;';
      
      const showing = Math.min(end, complaints.length);
      paginationDiv.innerHTML = `
        <div style="color:var(--text-muted);font-size:0.85rem;margin-bottom:12px;">
          Showing ${start + 1}-${showing} of ${complaints.length} complaints
        </div>
        ${hasMore ? `
          <button class="hero-btn hero-btn-secondary" id="loadMoreBtn" style="padding:10px 24px;">
            <i class="fa-solid fa-chevron-down"></i> Load More (${complaints.length - end} remaining)
          </button>
        ` : ''}
      `;
      container.appendChild(paginationDiv);
      
      // Bind load more
      if (hasMore) {
        document.getElementById('loadMoreBtn').addEventListener('click', () => {
          this.currentPage++;
          this.renderComplaints();
        });
      }
    }
    
    console.log('✅ Rendered', pageComplaints.length, 'complaint cards (Page', this.currentPage + 1, ')');
  },

  /**
   * Create complaint card element
   */
  createComplaintCard(complaint) {
    const card = document.createElement('div');
    card.className = 'chart-card';
    card.style.cssText = 'position:relative;overflow:hidden;';
    
    // Get priority badge
    const priorityBadge = this.getPriorityBadge(complaint.priority);
    const statusBadge = this.getStatusBadge(complaint.status);
    
    // Get category info
    const categoryIcon = complaint.category ? complaint.category.icon : 'fa-circle-question';
    const categoryColor = complaint.category ? complaint.category.color : '#6B7280';
    const categoryName = complaint.category ? complaint.category.name : 'Other';
    
    // Format date
    const createdDate = new Date(complaint.created_at);
    const timeAgo = this.getTimeAgo(createdDate);
    const dateStr = createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    // Assigned staff info
    const assignedHTML = complaint.assigned_staff 
      ? `
        <div style="display:flex;align-items:center;gap:8px;">
          <div class="profile-avatar" style="width:28px;height:28px;font-size:0.75rem;">${this.getInitials(complaint.assigned_staff.name)}</div>
          <div>
            <div style="font-size:0.75rem;font-weight:600;color:var(--text-primary);">${this.escapeHtml(complaint.assigned_staff.name)}</div>
            <div style="font-size:0.7rem;color:var(--text-muted);">${this.escapeHtml(complaint.assigned_staff.role || 'Staff')}</div>
          </div>
        </div>`
      : `
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="font-size:0.75rem;color:var(--text-muted);display:flex;align-items:center;gap:4px;">
            <i class="fa-solid fa-user-slash" style="color:var(--accent-amber);"></i>Unassigned
          </div>
        </div>`;
    
    card.innerHTML = `
      <div style="position:absolute;top:12px;right:12px;display:flex;gap:6px;">
        ${priorityBadge}
        ${statusBadge}
      </div>
      <div style="display:flex;align-items:start;gap:12px;margin-bottom:14px;">
        <div style="width:48px;height:48px;background:${categoryColor}15;border-radius:12px;display:flex;align-items:center;justify-content:center;color:${categoryColor};font-size:20px;flex-shrink:0;">
          <i class="fa-solid ${categoryIcon}"></i>
        </div>
        <div style="flex:1;">
          <div style="font-size:0.8rem;font-weight:600;color:var(--text-muted);margin-bottom:4px;">${this.escapeHtml(complaint.complaint_id)}</div>
          <h3 style="font-size:1.05rem;font-weight:700;color:var(--text-primary);margin-bottom:6px;">${this.escapeHtml(complaint.title)}</h3>
          <p style="font-size:0.82rem;color:var(--text-secondary);line-height:1.5;">${this.truncateText(this.escapeHtml(complaint.description), 120)}</p>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;padding-top:14px;border-top:1px solid var(--border-color);">
        <div>
          <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;color:var(--text-muted);margin-bottom:4px;">Category</div>
          <div style="font-size:0.85rem;font-weight:600;color:var(--text-primary);">
            <i class="fa-solid ${categoryIcon}" style="color:${categoryColor};margin-right:5px;"></i>${categoryName}
          </div>
        </div>
        <div>
          <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;color:var(--text-muted);margin-bottom:4px;">Location</div>
          <div style="font-size:0.85rem;font-weight:600;color:var(--text-primary);">
            <i class="fa-solid fa-building" style="color:var(--accent-blue);margin-right:5px;"></i>${this.escapeHtml(complaint.hostel_block)}${complaint.room_number ? ' – Room ' + complaint.room_number : ''}
          </div>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        ${assignedHTML}
        <div style="text-align:right;">
          <div style="font-size:0.75rem;color:var(--text-muted);">${timeAgo}</div>
          <div style="font-size:0.7rem;color:var(--text-muted);">${dateStr}</div>
        </div>
      </div>
    `;
    
    return card;
  },

  /**
   * Get priority badge HTML
   */
  getPriorityBadge(priority) {
    const badges = {
      'low': '<span class="badge badge-blue">Low</span>',
      'medium': '<span class="badge badge-amber">Medium</span>',
      'high': '<span class="badge badge-red">High</span>',
      'critical': '<span class="badge badge-red">Critical</span>'
    };
    return badges[priority] || badges['medium'];
  },

  /**
   * Get status badge HTML
   */
  getStatusBadge(status) {
    const badges = {
      'open': '<span class="badge badge-amber">Open</span>',
      'assigned': '<span class="badge badge-blue">Assigned</span>',
      'in_progress': '<span class="badge badge-blue">In Progress</span>',
      'resolved': '<span class="badge badge-green">Resolved</span>',
      'closed': '<span class="badge badge-muted">Closed</span>'
    };
    return badges[status] || badges['open'];
  },

  /**
   * Get time ago string
   */
  getTimeAgo(date) {
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' min ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
    if (seconds < 604800) return Math.floor(seconds / 86400) + ' days ago';
    return date.toLocaleDateString();
  },

  /**
   * Get initials from name
   */
  getInitials(name) {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  },

  /**
   * Truncate text
   */
  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  },

  /**
   * Escape HTML
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * Show loading state
   */
  showLoading() {
    const container = document.querySelector('.page-wrapper > section:last-child > div:last-child');
    if (!container) return;
    
    container.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px;">
        <i class="fa-solid fa-spinner fa-spin" style="font-size:3rem;color:var(--accent-purple);margin-bottom:16px;"></i>
        <p style="color:var(--text-muted);font-size:0.9rem;">Loading complaints...</p>
      </div>`;
  },

  /**
   * Show empty state
   */
  showEmpty() {
    const container = document.querySelector('.page-wrapper > section:last-child > div:last-child');
    if (!container) return;
    
    container.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px;">
        <i class="fa-solid fa-inbox" style="font-size:3rem;color:var(--text-muted);opacity:0.3;margin-bottom:16px;"></i>
        <p style="color:var(--text-muted);font-size:0.9rem;">No complaints found</p>
        <p style="color:var(--text-muted);font-size:0.8rem;margin-top:8px;">Try adjusting your filters</p>
      </div>`;
  },

  /**
   * Show error state
   */
  showError(message) {
    const container = document.querySelector('.page-wrapper > section:last-child > div:last-child');
    if (!container) return;
    
    container.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px;">
        <i class="fa-solid fa-triangle-exclamation" style="font-size:3rem;color:var(--accent-red);opacity:0.6;margin-bottom:16px;"></i>
        <p style="color:var(--text-muted);font-size:0.9rem;">${message}</p>
        <button class="hero-btn hero-btn-secondary" onclick="ComplaintsManager.loadComplaints()" style="margin-top:16px;">
          <i class="fa-solid fa-rotate-right"></i> Retry
        </button>
      </div>`;
  },
  
  /**
   * Bind filter events
   */
  bindFilterEvents() {
    // Search input with debounce
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.filters.search = e.target.value;
          this.applySearchFilter();
          console.log('🔍 Search:', e.target.value);
        }, 300);
      });
    }
    
    // Status filter
    const statusFilter = document.getElementById('filterStatus');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        this.filters.status = e.target.value;
        this.currentPage = 0;
        this.loadComplaints();
        console.log('📊 Status filter:', e.target.value || 'All');
      });
    }
    
    // Category filter
    const categoryFilter = document.getElementById('filterCategory');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => {
        this.filters.category_id = e.target.value;
        this.currentPage = 0;
        this.loadComplaints();
        console.log('🏷️  Category filter:', e.target.value || 'All');
      });
    }
    
    // Priority filter
    const priorityFilter = document.getElementById('filterPriority');
    if (priorityFilter) {
      priorityFilter.addEventListener('change', (e) => {
        this.filters.priority = e.target.value;
        this.currentPage = 0;
        this.loadComplaints();
        console.log('🚩 Priority filter:', e.target.value || 'All');
      });
    }
    
    // Block filter
    const blockFilter = document.getElementById('filterBlock');
    if (blockFilter) {
      blockFilter.addEventListener('change', (e) => {
        this.filters.hostel_block = e.target.value;
        this.currentPage = 0;
        this.loadComplaints();
        console.log('🏢 Block filter:', e.target.value || 'All');
      });
    }
    
    // Clear filters button
    const clearBtn = document.querySelector('[aria-label="Clear all filters"]');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.clearFilters();
      });
    }
    
    // Sorting tabs
    const sortTabs = document.querySelectorAll('.section-actions .tab-btn');
    sortTabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        // Remove active from all
        sortTabs.forEach(t => t.classList.remove('active'));
        // Add active to clicked
        tab.classList.add('active');
        
        // Apply sorting
        if (index === 0) this.sortComplaints('recent');
        else if (index === 1) this.sortComplaints('urgent');
        else if (index === 2) this.sortComplaints('assigned');
      });
    });
    
    // Raise Complaint button
    const raiseComplaintBtn = document.getElementById('raiseComplaintBtn');
    if (raiseComplaintBtn) {
      raiseComplaintBtn.addEventListener('click', () => {
        this.openComplaintModal();
      });
    }
    
    console.log('✅ Filter events bound');
  },
  
  /**
   * Clear all filters
   */
  clearFilters() {
    this.filters = {
      status: '',
      category_id: '',
      priority: '',
      hostel_block: '',
      search: ''
    };
    
    // Reset UI
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    
    const statusFilter = document.getElementById('filterStatus');
    if (statusFilter) statusFilter.value = '';
    
    const categoryFilter = document.getElementById('filterCategory');
    if (categoryFilter) categoryFilter.value = '';
    
    const priorityFilter = document.getElementById('filterPriority');
    if (priorityFilter) priorityFilter.value = '';
    
    const blockFilter = document.getElementById('filterBlock');
    if (blockFilter) blockFilter.value = '';
    
    // Reload
    this.currentPage = 0;
    this.loadComplaints();
    
    console.log('🔄 Filters cleared');
  },
  
  /**
   * Sort complaints
   */
  sortComplaints(sortType) {
    let sorted = [...this.complaints];
    
    switch(sortType) {
      case 'recent':
        sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        console.log('📅 Sorted by: Recent');
        break;
      case 'urgent':
        const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
        sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        console.log('🚨 Sorted by: Urgent');
        break;
      case 'assigned':
        sorted.sort((a, b) => {
          if (a.assigned_to && !b.assigned_to) return -1;
          if (!a.assigned_to && b.assigned_to) return 1;
          return 0;
        });
        console.log('👤 Sorted by: Assigned');
        break;
    }
    
    this.complaints = sorted;
    this.currentPage = 0;
    this.renderComplaints();
  },
  
  /**
   * Open complaint registration modal
   */
  openComplaintModal() {
    // Create modal HTML
    const modalHTML = `
      <div class="modal-overlay" id="complaintModal" style="display:flex;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:9999;align-items:center;justify-content:center;animation:fadeIn 0.2s ease;">
        <div class="modal-content" style="background:var(--bg-card);border-radius:var(--radius-lg);width:90%;max-width:600px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);animation:slideUp 0.3s ease;">
          <!-- Modal Header -->
          <div style="padding:24px;border-bottom:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center;">
            <div>
              <h2 style="font-size:1.3rem;font-weight:700;color:var(--text-primary);margin:0;display:flex;align-items:center;gap:10px;">
                <i class="fa-solid fa-triangle-exclamation" style="color:var(--accent-purple);"></i>
                Raise New Complaint
              </h2>
              <p style="font-size:0.85rem;color:var(--text-muted);margin:4px 0 0 34px;">Fill in the details below to submit your complaint</p>
            </div>
            <button onclick="ComplaintsManager.closeComplaintModal()" style="width:36px;height:36px;border:none;background:var(--bg-hover);border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--text-muted);transition:all 0.2s;">
              <i class="fa-solid fa-xmark" style="font-size:1.2rem;"></i>
            </button>
          </div>
          
          <!-- Modal Body -->
          <form id="complaintForm" style="padding:24px;">
            <!-- Student Name -->
            <div style="margin-bottom:20px;">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-primary);margin-bottom:8px;">
                Student Name <span style="color:var(--accent-red);">*</span>
              </label>
              <input type="text" id="studentName" required
                style="width:100%;padding:10px 14px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:var(--radius-sm);font-size:0.9rem;color:var(--text-primary);transition:border-color 0.2s;"
                placeholder="Enter your full name" />
              <div class="error-message" id="studentNameError" style="color:var(--accent-red);font-size:0.75rem;margin-top:4px;display:none;"></div>
            </div>
            
            <!-- Hostel Block & Room Number -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
              <div>
                <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-primary);margin-bottom:8px;">
                  Hostel Block <span style="color:var(--accent-red);">*</span>
                </label>
                <select id="hostelBlock" required
                  style="width:100%;padding:10px 14px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:var(--radius-sm);font-size:0.9rem;color:var(--text-primary);cursor:pointer;">
                  <option value="">Select Block</option>
                  <option value="Main Block">Main Block</option>
                  <option value="Rudramadevi">Rudramadevi</option>
                  <option value="Annapurna AC">Annapurna AC</option>
                  <option value="N Square">N Square</option>
                  <option value="Galaxy">Galaxy</option>
                  <option value="Elite">Elite</option>
                  <option value="Delight">Delight</option>
                </select>
                <div class="error-message" id="hostelBlockError" style="color:var(--accent-red);font-size:0.75rem;margin-top:4px;display:none;"></div>
              </div>
              <div>
                <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-primary);margin-bottom:8px;">
                  Room Number
                </label>
                <input type="text" id="roomNumber"
                  style="width:100%;padding:10px 14px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:var(--radius-sm);font-size:0.9rem;color:var(--text-primary);"
                  placeholder="e.g., 404" />
              </div>
            </div>
            
            <!-- Category & Priority -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
              <div>
                <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-primary);margin-bottom:8px;">
                  Category <span style="color:var(--accent-red);">*</span>
                </label>
                <select id="complaintCategory" required
                  style="width:100%;padding:10px 14px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:var(--radius-sm);font-size:0.9rem;color:var(--text-primary);cursor:pointer;">
                  <option value="">Select Category</option>
                </select>
                <div class="error-message" id="categoryError" style="color:var(--accent-red);font-size:0.75rem;margin-top:4px;display:none;"></div>
              </div>
              <div>
                <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-primary);margin-bottom:8px;">
                  Priority <span style="color:var(--accent-red);">*</span>
                </label>
                <select id="complaintPriority" required
                  style="width:100%;padding:10px 14px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:var(--radius-sm);font-size:0.9rem;color:var(--text-primary);cursor:pointer;">
                  <option value="">Select Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <div class="error-message" id="priorityError" style="color:var(--accent-red);font-size:0.75rem;margin-top:4px;display:none;"></div>
              </div>
            </div>
            
            <!-- Title -->
            <div style="margin-bottom:20px;">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-primary);margin-bottom:8px;">
                Complaint Title <span style="color:var(--accent-red);">*</span>
              </label>
              <input type="text" id="complaintTitle" required
                style="width:100%;padding:10px 14px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:var(--radius-sm);font-size:0.9rem;color:var(--text-primary);"
                placeholder="Brief summary of the issue" />
              <div class="error-message" id="titleError" style="color:var(--accent-red);font-size:0.75rem;margin-top:4px;display:none;"></div>
            </div>
            
            <!-- Description -->
            <div style="margin-bottom:20px;">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-primary);margin-bottom:8px;">
                Description <span style="color:var(--accent-red);">*</span>
              </label>
              <textarea id="complaintDescription" required rows="4"
                style="width:100%;padding:10px 14px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:var(--radius-sm);font-size:0.9rem;color:var(--text-primary);resize:vertical;font-family:inherit;"
                placeholder="Provide detailed information about the issue..."></textarea>
              <div class="error-message" id="descriptionError" style="color:var(--accent-red);font-size:0.75rem;margin-top:4px;display:none;"></div>
            </div>
            
            <!-- Image Upload (Optional) -->
            <div style="margin-bottom:20px;">
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-primary);margin-bottom:8px;">
                Attach Image (Optional)
              </label>
              <div style="position:relative;">
                <input type="file" id="complaintImage" accept="image/*"
                  style="width:100%;padding:10px 14px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:var(--radius-sm);font-size:0.85rem;color:var(--text-primary);cursor:pointer;" />
                <div id="imagePreview" style="margin-top:10px;display:none;">
                  <img id="previewImg" style="max-width:100%;max-height:200px;border-radius:var(--radius-sm);border:1px solid var(--border-color);" />
                </div>
              </div>
              <p style="font-size:0.75rem;color:var(--text-muted);margin-top:6px;">
                <i class="fa-solid fa-info-circle"></i> Upload a photo of the issue (Max 5MB, JPG/PNG)
              </p>
            </div>
          </form>
          
          <!-- Modal Footer -->
          <div style="padding:20px 24px;border-top:1px solid var(--border-color);display:flex;justify-content:flex-end;gap:12px;background:var(--bg-tertiary);">
            <button onclick="ComplaintsManager.closeComplaintModal()" class="hero-btn hero-btn-secondary" style="padding:10px 20px;">
              <i class="fa-solid fa-xmark"></i> Cancel
            </button>
            <button onclick="ComplaintsManager.submitComplaint(event)" class="hero-btn hero-btn-primary" id="submitComplaintBtn" style="padding:10px 20px;">
              <i class="fa-solid fa-paper-plane"></i> Submit Complaint
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Populate category dropdown
    this.populateModalCategories();
    
    // Add image preview listener
    const imageInput = document.getElementById('complaintImage');
    if (imageInput) {
      imageInput.addEventListener('change', (e) => {
        this.previewImage(e.target.files[0]);
      });
    }
    
    // Close on overlay click
    document.getElementById('complaintModal').addEventListener('click', (e) => {
      if (e.target.id === 'complaintModal') {
        this.closeComplaintModal();
      }
    });
    
    console.log('📝 Complaint modal opened');
  },


/* ============================================================
   THEME MANAGER
   ============================================================ */
const ThemeManager = {
  KEY: 'campuspulse_theme',

  get() {
    return localStorage.getItem(this.KEY) || 'light';
  },

  set(theme) {
    localStorage.setItem(this.KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
    this.updateUI(theme);
  },

  toggle() {
    const current = this.get();
    this.set(current === 'light' ? 'dark' : 'light');
  },

  updateUI(theme) {
    const isDark = theme === 'dark';
    const icon = document.getElementById('themeIcon');
    const sidebarIcon = document.getElementById('sidebarThemeIcon');
    const sidebarLabel = document.getElementById('sidebarThemeLabel');
    if (icon) icon.className = isDark ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    if (sidebarIcon) sidebarIcon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    if (sidebarLabel) sidebarLabel.textContent = isDark ? 'Light Mode' : 'Dark Mode';
  },

  init() {
    const saved = this.get();
    document.documentElement.setAttribute('data-theme', saved);
    this.updateUI(saved);

    const toggle = document.getElementById('themeToggle');
    const sidebarBtn = document.getElementById('sidebarThemeBtn');
    if (toggle) toggle.addEventListener('click', () => this.toggle());
    if (sidebarBtn) sidebarBtn.addEventListener('click', () => this.toggle());
  }
};

/* ============================================================
   SIDEBAR MANAGER
   ============================================================ */
const SidebarManager = {
  KEY: 'campuspulse_sidebar_collapsed',

  init() {
    const layout = document.getElementById('appLayout');
    const sidebar = document.getElementById('sidebar');
    const collapseBtn = document.getElementById('sidebarCollapseBtn');
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const overlay = document.getElementById('mobileOverlay');
    const icon = document.getElementById('collapseIcon');
    const topbar = document.querySelector('.topbar');

    const collapsed = localStorage.getItem(this.KEY) === 'true';
    if (collapsed && window.innerWidth > 768) {
      layout.classList.add('sidebar-collapsed');
      if (topbar) topbar.style.left = 'var(--sidebar-collapsed-width)';
      if (icon) icon.className = 'fa-solid fa-chevron-right';
    }

    // Desktop collapse
    if (collapseBtn) {
      collapseBtn.addEventListener('click', () => {
        layout.classList.toggle('sidebar-collapsed');
        const isCollapsed = layout.classList.contains('sidebar-collapsed');
        localStorage.setItem(this.KEY, isCollapsed);
        if (topbar) topbar.style.left = isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)';
        if (icon) icon.className = isCollapsed ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-left';
      });
    }

    // Mobile menu
    if (mobileBtn) {
      mobileBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
        overlay.classList.toggle('active');
      });
    }
    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
      });
    }
  }
};

/* ============================================================
   TOPBAR MANAGER
   ============================================================ */
const TopbarManager = {
  init() {
    this.setDate();
    this.initProfile();
    this.initNotifications();
  },

  setDate() {
    const el = document.getElementById('topbarDate');
    if (!el) return;
    const now = new Date();
    const opts = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    el.textContent = now.toLocaleDateString('en-IN', opts);
  },


  initProfile() {
    const btn = document.getElementById('profileBtn');
    const dropdown = document.getElementById('profileDropdown');
    if (!btn || !dropdown) return;
    btn.addEventListener('click', e => {
      e.stopPropagation();
      dropdown.classList.toggle('open');
      document.getElementById('notifPanel')?.classList.remove('open');
    });
    document.addEventListener('click', () => dropdown.classList.remove('open'));
  },

  initNotifications() {
    const btn = document.getElementById('notifBtn');
    const panel = document.getElementById('notifPanel');
    if (!btn || !panel) return;
    btn.addEventListener('click', e => {
      e.stopPropagation();
      panel.classList.toggle('open');
      document.getElementById('profileDropdown')?.classList.remove('open');
    });
    document.addEventListener('click', () => panel.classList.remove('open'));
  }
};

/* ============================================================
   INITIALIZATION
   ============================================================ */
document.addEventListener('DOMContentLoaded', async () => {
  ThemeManager.init();
  SidebarManager.init();
  TopbarManager.init();
  await ComplaintsManager.init();
  
  console.log('✅ CampusPulse Complaints Module initialized successfully!');
});

  
  /**
   * Populate category dropdown in modal
   */
  populateModalCategories() {
    const select = document.getElementById('complaintCategory');
    if (!select) return;
    
    select.innerHTML = '<option value="">Select Category</option>';
    this.categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = category.name;
      select.appendChild(option);
    });
  },
  
  /**
   * Preview uploaded image
   */
  previewImage(file) {
    if (!file) return;
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      this.showToast('Image size must be less than 5MB', 'error');
      document.getElementById('complaintImage').value = '';
      return;
    }
    
    // Validate file type
    if (!file.type.match('image.*')) {
      this.showToast('Please upload a valid image file', 'error');
      document.getElementById('complaintImage').value = '';
      return;
    }
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = document.getElementById('imagePreview');
      const img = document.getElementById('previewImg');
      if (preview && img) {
        img.src = e.target.result;
        preview.style.display = 'block';
      }
    };
    reader.readAsDataURL(file);
  },
  
  /**
   * Close complaint modal
   */
  closeComplaintModal() {
    const modal = document.getElementById('complaintModal');
    if (modal) {
      modal.remove();
    }
    console.log('❌ Complaint modal closed');
  },
  
  /**
   * Submit complaint
   */
  async submitComplaint(event) {
    if (event) event.preventDefault();
    
    // Get form values
    const studentName = document.getElementById('studentName').value.trim();
    const hostelBlock = document.getElementById('hostelBlock').value;
    const roomNumber = document.getElementById('roomNumber').value.trim();
    const categoryId = document.getElementById('complaintCategory').value;
    const priority = document.getElementById('complaintPriority').value;
    const title = document.getElementById('complaintTitle').value.trim();
    const description = document.getElementById('complaintDescription').value.trim();
    
    // Clear previous errors
    document.querySelectorAll('.error-message').forEach(el => {
      el.style.display = 'none';
      el.textContent = '';
    });
    
    // Validate fields
    let hasErrors = false;
    
    if (!studentName) {
      this.showFieldError('studentNameError', 'Student name is required');
      hasErrors = true;
    }
    
    if (!hostelBlock) {
      this.showFieldError('hostelBlockError', 'Please select a hostel block');
      hasErrors = true;
    }
    
    if (!categoryId) {
      this.showFieldError('categoryError', 'Please select a category');
      hasErrors = true;
    }
    
    if (!priority) {
      this.showFieldError('priorityError', 'Please select a priority');
      hasErrors = true;
    }
    
    if (!title) {
      this.showFieldError('titleError', 'Complaint title is required');
      hasErrors = true;
    } else if (title.length < 5) {
      this.showFieldError('titleError', 'Title must be at least 5 characters');
      hasErrors = true;
    }
    
    if (!description) {
      this.showFieldError('descriptionError', 'Description is required');
      hasErrors = true;
    } else if (description.length < 20) {
      this.showFieldError('descriptionError', 'Description must be at least 20 characters');
      hasErrors = true;
    }
    
    if (hasErrors) {
      this.showToast('Please fix the errors before submitting', 'error');
      return;
    }
    
    // Disable submit button
    const submitBtn = document.getElementById('submitComplaintBtn');
    const originalHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
    
    try {
      // Prepare data
      const complaintData = {
        student_id: 1, // TODO: Get from logged-in user
        hostel_block: hostelBlock,
        room_number: roomNumber || null,
        category_id: parseInt(categoryId),
        title: title,
        description: description,
        priority: priority
      };
      
      // Submit to API
      const response = await fetch(`${API_BASE}/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(complaintData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Success!
        this.showToast('Complaint submitted successfully!', 'success');
        this.closeComplaintModal();
        
        // Refresh data
        await this.loadStats();
        await this.loadComplaints();
        
        console.log('✅ Complaint submitted:', data.complaint.complaint_id);
      } else {
        throw new Error(data.message || 'Failed to submit complaint');
      }
    } catch (error) {
      console.error('❌ Error submitting complaint:', error);
      this.showToast(error.message || 'Failed to submit complaint. Please try again.', 'error');
      
      // Re-enable submit button
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHTML;
    }
  },
  
  /**
   * Show field error
   */
  showFieldError(errorId, message) {
    const errorEl = document.getElementById(errorId);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
  },
  
  /**
   * Show toast notification
   */
  showToast(message, type = 'info') {
    // Remove existing toast
    const existingToast = document.getElementById('toast');
    if (existingToast) existingToast.remove();
    
    // Create toast
    const bgColor = type === 'success' ? 'var(--accent-green)' : 
                    type === 'error' ? 'var(--accent-red)' : 
                    'var(--accent-blue)';
    
    const icon = type === 'success' ? 'fa-circle-check' :
                 type === 'error' ? 'fa-circle-xmark' :
                 'fa-info-circle';
    
    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `
      position:fixed;
      top:20px;
      right:20px;
      background:${bgColor};
      color:#fff;
      padding:16px 20px;
      border-radius:var(--radius-lg);
      box-shadow:0 4px 12px rgba(0,0,0,0.15);
      z-index:10000;
      display:flex;
      align-items:center;
      gap:12px;
      font-size:0.9rem;
      font-weight:500;
      animation:slideInRight 0.3s ease;
      max-width:400px;
    `;
    
    toast.innerHTML = `
      <i class="fa-solid ${icon}" style="font-size:1.2rem;"></i>
      <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
};
