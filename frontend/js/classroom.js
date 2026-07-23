/**
 * ============================================================
 * CampusPulse AI – Smart Classroom Finder
 * File: frontend/js/classroom.js
 *
 * Modules (IIFE pattern mirrors dashboard.js):
 *
 *  1.  ThemeManager          — dark/light toggle, localStorage sync
 *  2.  SidebarManager        — collapse, mobile menu, nav active state
 *  3.  TopbarManager         — date, profile dropdown, notifications
 *  4.  ClassroomData         — static room dataset (source of truth)
 *  5.  FilterManager         — block / floor / type / capacity / status
 *  6.  SearchManager         — real-time topbar search with debounce
 *  7.  GridManager           — render, animate, empty-state, AI highlight
 *  8.  AIRecommendation      — confidence bar animation, highlight pulse
 *  9.  CardInteraction       — hover effects, book/schedule button actions
 *  10. LoadMoreManager       — progressive card reveal
 *  11. LiveClock             — real-time date in topbar
 *  12. RippleEffect          — button click ripple animation
 *  13. Init                  — DOMContentLoaded boot sequence
 * ============================================================
 */

'use strict';

/* ============================================================
   1. THEME MANAGER
   Exact same localStorage key as dashboard.js so theme stays
   in sync when navigating between pages.
   ============================================================ */
const ThemeManager = {
  KEY: 'campuspulse_theme',

  /** Read saved theme (default: light) */
  get() {
    return localStorage.getItem(this.KEY) || 'light';
  },

  /** Apply theme to <html> and update all toggle UI */
  set(theme) {
    localStorage.setItem(this.KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
    this._updateUI(theme);
  },

  /** Flip between dark and light */
  toggle() {
    this.set(this.get() === 'light' ? 'dark' : 'light');
  },

  /** Sync icon, label, toggle thumb position */
  _updateUI(theme) {
    const isDark = theme === 'dark';

    // Topbar toggle thumb icon
    const icon = document.getElementById('themeIcon');
    if (icon) icon.className = isDark ? 'fa-solid fa-moon' : 'fa-solid fa-sun';

    // Sidebar footer button
    const sidebarIcon  = document.getElementById('sidebarThemeIcon');
    const sidebarLabel = document.getElementById('sidebarThemeLabel');
    if (sidebarIcon)  sidebarIcon.className  = isDark ? 'fa-solid fa-sun'  : 'fa-solid fa-moon';
    if (sidebarLabel) sidebarLabel.textContent = isDark ? 'Light Mode' : 'Dark Mode';
  },

  init() {
    // Restore saved theme immediately (before paint)
    this.set(this.get());

    // Topbar pill toggle
    const toggle = document.getElementById('themeToggle');
    if (toggle) toggle.addEventListener('click', () => this.toggle());

    // Sidebar footer button
    const sidebarBtn = document.getElementById('sidebarThemeBtn');
    if (sidebarBtn) sidebarBtn.addEventListener('click', () => this.toggle());
  }
};


/* ============================================================
   2. SIDEBAR MANAGER
   Collapse/expand on desktop, slide-in on mobile, nav active
   state restore from localStorage.
   ============================================================ */
const SidebarManager = {
  KEY: 'campuspulse_sidebar_collapsed',

  init() {
    const layout      = document.getElementById('appLayout');
    const sidebar     = document.getElementById('sidebar');
    const collapseBtn = document.getElementById('sidebarCollapseBtn');
    const mobileBtn   = document.getElementById('mobileMenuBtn');
    const overlay     = document.getElementById('mobileOverlay');
    const icon        = document.getElementById('collapseIcon');
    const topbar      = document.querySelector('.topbar');

    if (!layout || !sidebar) return;

    /* ── Restore collapsed state ── */
    const wasCollapsed = localStorage.getItem(this.KEY) === 'true';
    if (wasCollapsed && window.innerWidth > 768) {
      layout.classList.add('sidebar-collapsed');
      if (topbar) topbar.style.left = 'var(--sidebar-collapsed-width)';
      if (icon)   icon.className    = 'fa-solid fa-chevron-right';
    }

    /* ── Desktop collapse button ── */
    if (collapseBtn) {
      collapseBtn.addEventListener('click', () => {
        layout.classList.toggle('sidebar-collapsed');
        const collapsed = layout.classList.contains('sidebar-collapsed');
        localStorage.setItem(this.KEY, collapsed);
        if (topbar) {
          topbar.style.left = collapsed
            ? 'var(--sidebar-collapsed-width)'
            : 'var(--sidebar-width)';
        }
        if (icon) {
          icon.className = collapsed
            ? 'fa-solid fa-chevron-right'
            : 'fa-solid fa-chevron-left';
        }
      });
    }

    /* ── Mobile hamburger ── */
    if (mobileBtn) {
      mobileBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
        if (overlay) overlay.classList.toggle('active');
      });
    }

    /* ── Overlay click closes sidebar ── */
    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
      });
    }

    /* ── Keyboard: Escape closes mobile sidebar ── */
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sidebar.classList.contains('mobile-open')) {
        sidebar.classList.remove('mobile-open');
        if (overlay) overlay.classList.remove('active');
      }
    });

    /* ── Close sidebar on nav click (mobile) ── */
    sidebar.querySelectorAll('.nav-item').forEach((item) => {
      item.addEventListener('click', () => {
        sidebar.classList.remove('mobile-open');
        if (overlay) overlay.classList.remove('active');
      });
    });
  }
};
/* ============================================================
   3. TOPBAR MANAGER
   Date display, profile dropdown, notification panel toggle.
   ============================================================ */
const TopbarManager = {
  init() {
    this._setDate();
    this._initProfile();
    this._initNotifications();
  },

  /** Render today's date in the topbar */
  _setDate() {
    const el = document.getElementById('topbarDate');
    if (!el) return;
    const now  = new Date();
    const opts = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    el.textContent = now.toLocaleDateString('en-IN', opts);
  },

  /** Profile dropdown open/close */
  _initProfile() {
    const btn      = document.getElementById('profileBtn');
    const dropdown = document.getElementById('profileDropdown');
    if (!btn || !dropdown) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('open');
      // Close notification panel if open
      const np = document.getElementById('notifPanel');
      if (np) np.classList.remove('open');
    });

    document.addEventListener('click', () => dropdown.classList.remove('open'));
  },

  /** Notification panel open/close */
  _initNotifications() {
    const btn   = document.getElementById('notifBtn');
    const panel = document.getElementById('notifPanel');
    if (!btn || !panel) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.classList.toggle('open');
      // Close profile dropdown if open
      const pd = document.getElementById('profileDropdown');
      if (pd) pd.classList.remove('open');
    });

    document.addEventListener('click', () => panel.classList.remove('open'));
  }
};


/* ============================================================
   4. CLASSROOM DATA
   Single source of truth for all room cards.
   Each object maps to the data-* attributes read by filters.

   Fields:
     id          – unique room identifier
     block       – A | B | C | D
     floor       – G | 1 | 2 | 3 | 4 | 5
     number      – display label (e.g. "A-101")
     type        – lecture | seminar | lab | tutorial | conference
     capacity    – numeric seats
     status      – available | soon | occupied
     currentClass – string or null
     nextClass    – string
     availableUntil – string
     aiPick      – boolean (highlight with AI badge)
   ============================================================ */
const ClassroomData = {
  rooms: [
    /* ── Block A ── */
    { id:'A101', block:'A', floor:'G', number:'A-101', type:'lecture',    capacity:120, status:'available', currentClass:null,                    nextClass:'OS Lab · 3:00 PM',         availableUntil:'2:50 PM today',    aiPick:false },
    { id:'A102', block:'A', floor:'G', number:'A-102', type:'lecture',    capacity:80,  status:'occupied',  currentClass:'Data Structures · Prof. Mehta', nextClass:'DBMS · 3:30 PM',           availableUntil:'After 5:30 PM',    aiPick:false },
    { id:'A201', block:'A', floor:'2', number:'A-201', type:'lab',        capacity:40,  status:'soon',      currentClass:null,                    nextClass:'Python Lab · in 20 min',   availableUntil:'1:40 PM · Hurry!', aiPick:false },
    { id:'A202', block:'A', floor:'2', number:'A-202', type:'seminar',    capacity:30,  status:'available', currentClass:null,                    nextClass:'Research Seminar · 4:00 PM',availableUntil:'3:50 PM today',   aiPick:false },
    { id:'A204', block:'A', floor:'2', number:'A-204', type:'lecture',    capacity:80,  status:'available', currentClass:null,                    nextClass:'AI & ML · 5:00 PM',        availableUntil:'4:50 PM · 3 hrs free', aiPick:true },
    { id:'A301', block:'A', floor:'3', number:'A-301', type:'lecture',    capacity:120, status:'occupied',  currentClass:'Networks · Prof. Sharma',       nextClass:'Cloud Computing · 5:00 PM', availableUntil:'After 6:00 PM',   aiPick:false },
    { id:'A401', block:'A', floor:'4', number:'A-401', type:'tutorial',   capacity:25,  status:'available', currentClass:null,                    nextClass:'Tutorial · 4:30 PM',       availableUntil:'4:20 PM today',    aiPick:false },
    { id:'A501', block:'A', floor:'5', number:'A-501', type:'conference', capacity:20,  status:'occupied',  currentClass:'Faculty Meeting',               nextClass:'—',                        availableUntil:'After 6:00 PM',    aiPick:false },

    /* ── Block B ── */
    { id:'B101', block:'B', floor:'G', number:'B-101', type:'lecture',    capacity:90,  status:'occupied',  currentClass:'Algorithms · Dr. Patel',         nextClass:'Compiler Design · 3:00 PM', availableUntil:'After 5:00 PM', aiPick:false },
    { id:'B102', block:'B', floor:'G', number:'B-102', type:'tutorial',   capacity:25,  status:'available', currentClass:null,                    nextClass:'Tutorial · 4:30 PM',       availableUntil:'4:20 PM today',  aiPick:false },
    { id:'B201', block:'B', floor:'2', number:'B-201', type:'lab',        capacity:45,  status:'soon',      currentClass:null,                    nextClass:'Web Dev Lab · in 15 min',  availableUntil:'1:45 PM · 15 min left', aiPick:false },
    { id:'B202', block:'B', floor:'2', number:'B-202', type:'lab',        capacity:45,  status:'available', currentClass:null,                    nextClass:'ML Lab · 5:00 PM',         availableUntil:'4:50 PM today',  aiPick:false },
    { id:'B301', block:'B', floor:'3', number:'B-301', type:'conference', capacity:20,  status:'available', currentClass:null,                    nextClass:'—',                        availableUntil:'End of day',      aiPick:false },
    { id:'B401', block:'B', floor:'4', number:'B-401', type:'seminar',    capacity:35,  status:'occupied',  currentClass:'Research Presentation',         nextClass:'Review · 5:30 PM',         availableUntil:'After 5:30 PM', aiPick:false },
    { id:'B501', block:'B', floor:'5', number:'B-501', type:'lecture',    capacity:100, status:'available', currentClass:null,                    nextClass:'Electronics · 4:00 PM',    availableUntil:'3:50 PM today',  aiPick:false },

    /* ── Block C ── */
    { id:'C101', block:'C', floor:'G', number:'C-101', type:'lecture',    capacity:150, status:'occupied',  currentClass:'Mathematics II · Prof. Rao',    nextClass:'Statistics · 4:00 PM',     availableUntil:'After 6:00 PM',  aiPick:false },
    { id:'C102', block:'C', floor:'G', number:'C-102', type:'seminar',    capacity:30,  status:'available', currentClass:null,                    nextClass:'Design Thinking · 5:00 PM',availableUntil:'4:50 PM today',  aiPick:false },
    { id:'C201', block:'C', floor:'2', number:'C-201', type:'lab',        capacity:50,  status:'soon',      currentClass:null,                    nextClass:'CAD Lab · in 25 min',      availableUntil:'1:55 PM · Hurry!', aiPick:false },
    { id:'C301', block:'C', floor:'3', number:'C-301', type:'tutorial',   capacity:20,  status:'available', currentClass:null,                    nextClass:'No more classes today',    availableUntil:'End of day',      aiPick:false },
    { id:'C401', block:'C', floor:'4', number:'C-401', type:'lecture',    capacity:80,  status:'occupied',  currentClass:'Thermodynamics · Dr. Nair',      nextClass:'Fluid Mechanics · 5:00 PM',availableUntil:'After 6:00 PM', aiPick:false },

    /* ── Block D ── */
    { id:'D101', block:'D', floor:'G', number:'D-101', type:'lecture',    capacity:100, status:'available', currentClass:null,                    nextClass:'Management · 4:00 PM',     availableUntil:'3:50 PM today',   aiPick:false },
    { id:'D201', block:'D', floor:'2', number:'D-201', type:'lab',        capacity:40,  status:'occupied',  currentClass:'IoT Lab · Prof. Joshi',          nextClass:'Embedded · 4:30 PM',       availableUntil:'After 5:30 PM', aiPick:false },
    { id:'D202', block:'D', floor:'2', number:'D-202', type:'seminar',    capacity:25,  status:'available', currentClass:null,                    nextClass:'Case Study · 5:00 PM',     availableUntil:'4:50 PM today',   aiPick:false },
    { id:'D301', block:'D', floor:'3', number:'D-301', type:'conference', capacity:15,  status:'soon',      currentClass:null,                    nextClass:'Board Meeting · in 30 min',availableUntil:'1:30 PM · Hurry!',aiPick:false },
    { id:'D401', block:'D', floor:'4', number:'D-401', type:'lecture',    capacity:90,  status:'occupied',  currentClass:'Business Law · Dr. Shah',        nextClass:'Accounting · 5:00 PM',     availableUntil:'After 6:00 PM', aiPick:false },
    { id:'D501', block:'D', floor:'5', number:'D-501', type:'tutorial',   capacity:20,  status:'available', currentClass:null,                    nextClass:'No more classes today',    availableUntil:'End of day',      aiPick:false },
  ],

  /** Return all rooms */
  getAll() {
    return this.rooms;
  },

  /** Filter rooms by criteria object */
  filter({ block, floor, type, capacity, status, query }) {
    return this.rooms.filter((room) => {
      if (block  && room.block  !== block)  return false;
      if (floor  && room.floor  !== floor)  return false;
      if (type   && room.type   !== type)   return false;
      if (status && room.status !== status) return false;

      /* ── Capacity buckets ── */
      if (capacity) {
        const c = room.capacity;
        if (capacity === 'small'  && !(c <= 30))          return false;
        if (capacity === 'medium' && !(c > 30  && c <= 60))  return false;
        if (capacity === 'large'  && !(c > 60  && c <= 120)) return false;
        if (capacity === 'xlarge' && !(c > 120))           return false;
      }

      /* ── Search query ── */
      if (query) {
        const q = query.toLowerCase();
        const searchable = [
          room.number, room.block, room.type,
          room.currentClass || '', room.nextClass
        ].join(' ').toLowerCase();
        if (!searchable.includes(q)) return false;
      }

      return true;
    });
  }
};
/* ============================================================
   5. FILTER MANAGER
   Reads all five <select> elements; on any change it asks
   GridManager to re-render with the combined criteria.
   ============================================================ */
const FilterManager = {
  /** Currently active criteria (empty string = "all") */
  criteria: {
    block:    '',
    floor:    '',
    type:     '',
    capacity: '',
    status:   ''
  },

  /** Resolve each select element once */
  _selects: {},

  init() {
    this._selects = {
      block:    document.getElementById('filterBlock'),
      floor:    document.getElementById('filterFloor'),
      type:     document.getElementById('filterType'),
      capacity: document.getElementById('filterCapacity'),
      status:   document.getElementById('filterAvailability')
    };

    /* Bind change listeners */
    Object.entries(this._selects).forEach(([key, el]) => {
      if (!el) return;
      el.addEventListener('change', () => {
        this.criteria[key] = el.value;
        this._triggerFilter();
        this._animateSelect(el);
      });
    });

    /* Apply button (may exist in the filter panel) */
    const applyBtn = document.querySelector('[aria-label="Apply filters"]');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => this._triggerFilter());
    }

    /* Clear button */
    const clearBtn = document.querySelector('[aria-label="Clear all filters"]');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearAll());
    }
  },

  /** Read all selects fresh and render */
  _triggerFilter() {
    /* Show loading shimmer for 200ms for perceived responsiveness */
    GridManager.showLoading();
    setTimeout(() => {
      const rooms = ClassroomData.filter({
        ...this.criteria,
        query: SearchManager.currentQuery
      });
      GridManager.render(rooms);
    }, 180);
  },

  /** Subtle scale pop on the changed select */
  _animateSelect(el) {
    el.style.transition = 'transform 0.15s ease';
    el.style.transform  = 'scale(1.02)';
    setTimeout(() => { el.style.transform = 'scale(1)'; }, 150);
  },

  /** Reset all filters to empty and re-render */
  clearAll() {
    Object.values(this._selects).forEach((el) => {
      if (el) el.value = '';
    });
    Object.keys(this.criteria).forEach((k) => { this.criteria[k] = ''; });
    SearchManager.clear();
    GridManager.showLoading();
    setTimeout(() => GridManager.render(ClassroomData.getAll()), 180);
  }
};


/* ============================================================
   6. SEARCH MANAGER
   Debounced real-time search on the topbar input.
   Matches: room number, block, type, current class, next class.
   ============================================================ */
const SearchManager = {
  currentQuery: '',
  _debounceTimer: null,
  DEBOUNCE_MS: 280,

  init() {
    const input = document.getElementById('searchInput');
    if (!input) return;

    input.addEventListener('input', (e) => {
      const raw = e.target.value.trim();
      clearTimeout(this._debounceTimer);
      this._debounceTimer = setTimeout(() => {
        this.currentQuery = raw;
        this._runSearch(raw);
      }, this.DEBOUNCE_MS);
    });

    /* Clear on Escape */
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        input.value = '';
        this.clear();
      }
    });

    /* Animate search icon on focus */
    input.addEventListener('focus', () => {
      const icon = input.previousElementSibling;
      if (icon) icon.style.color = 'var(--accent-purple)';
    });
    input.addEventListener('blur', () => {
      const icon = input.previousElementSibling;
      if (icon) icon.style.color = '';
    });
  },

  _runSearch(query) {
    GridManager.showLoading();
    setTimeout(() => {
      const rooms = ClassroomData.filter({
        ...FilterManager.criteria,
        query
      });
      GridManager.render(rooms);
    }, 160);
  },

  clear() {
    this.currentQuery = '';
    const input = document.getElementById('searchInput');
    if (input) input.value = '';
    GridManager.render(ClassroomData.filter(FilterManager.criteria));
  }
};


/* ============================================================
   7. GRID MANAGER
   Renders room cards into every block grid section,
   handles loading shimmer, empty state, and stagger animation.
   ============================================================ */
const GridManager = {
  /**
   * All room card HTML lives inside articles with
   * class "twin-card" (reused from dashboard) and
   * data attributes written during render.
   */

  /** Container selectors per block – targets the digital-twin-grid divs */
  _GRID_ID_A: 'classroomGridA',

  /** The main wrapping section holding all block groups */
  _SECTION_ID: 'classroomSection',

  /** Loading shimmer overlay element (created once) */
  _loader: null,

  init() {
    /* Insert a loading overlay once */
    this._loader = document.createElement('div');
    this._loader.id = 'crLoader';
    this._loader.setAttribute('aria-live', 'polite');
    this._loader.setAttribute('aria-label', 'Loading classrooms');
    this._loader.style.cssText = [
      'display:none',
      'position:fixed',
      'top:var(--topbar-height)',
      'left:0', 'right:0',
      'height:3px',
      'background:linear-gradient(90deg,#6C63FF,#22D3EE,#10B981)',
      'background-size:200% 100%',
      'animation:crLoader 1s linear infinite',
      'z-index:800'
    ].join(';');
    document.body.appendChild(this._loader);

    /* Inject keyframe for the loader bar */
    const style = document.createElement('style');
    style.textContent = `
      @keyframes crLoader {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `;
    document.head.appendChild(style);
  },

  showLoading() {
    if (this._loader) this._loader.style.display = 'block';
  },

  hideLoading() {
    if (this._loader) this._loader.style.display = 'none';
  },

  /**
   * Main render entry-point.
   * Groups rooms by block, writes each block section to the DOM,
   * then triggers stagger animation.
   */
  render(rooms) {
    const section = document.getElementById(this._SECTION_ID);
    if (!section) { this.hideLoading(); return; }

    /* Group by block */
    const byBlock = this._groupByBlock(rooms);

    /* Build HTML */
    let html = '';
    if (rooms.length === 0) {
      html = this._emptyStateHTML();
    } else {
      ['A', 'B', 'C', 'D'].forEach((block) => {
        const blockRooms = byBlock[block];
        if (!blockRooms || blockRooms.length === 0) return;
        html += this._blockSectionHTML(block, blockRooms);
      });
    }

    section.innerHTML = html;
    this.hideLoading();

    /* Stagger entrance animation */
    this._animateCards(section);

    /* Re-attach card interactions */
    CardInteraction.init();

    /* Re-animate confidence bars inside AI card */
    AIRecommendation.animateConfidenceBars();
  },

  /** Group room array into {A:[...], B:[...], ...} */
  _groupByBlock(rooms) {
    return rooms.reduce((acc, room) => {
      if (!acc[room.block]) acc[room.block] = [];
      acc[room.block].push(room);
      return acc;
    }, {});
  },

  /** Block header + grid for one block */
  _blockSectionHTML(block, rooms) {
    const available = rooms.filter(r => r.status === 'available').length;
    const occupied  = rooms.filter(r => r.status === 'occupied').length;
    const soon      = rooms.filter(r => r.status === 'soon').length;

    const gradMap = {
      A: 'var(--gradient-primary)',
      B: 'var(--gradient-secondary)',
      C: 'var(--gradient-success)',
      D: 'var(--gradient-warning)'
    };

    let badges = `<span class="badge badge-green">${available} Available</span>`;
    if (occupied) badges += ` <span class="badge badge-red">${occupied} Occupied</span>`;
    if (soon)     badges += ` <span class="badge badge-amber">${soon} Occupied Soon</span>`;

    const cards = rooms.map((r, i) => this._cardHTML(r, i)).join('');

    return `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap;">
        <div style="width:30px;height:30px;background:${gradMap[block]};border-radius:8px;
                    display:flex;align-items:center;justify-content:center;
                    color:#fff;font-size:13px;font-weight:800;flex-shrink:0;">${block}</div>
        <span style="font-size:0.92rem;font-weight:700;color:var(--text-primary);">Block ${block}</span>
        ${badges}
        <div style="flex:1;height:1px;background:var(--border-color);margin-left:4px;"></div>
      </div>
      <div class="digital-twin-grid" style="margin-bottom:28px;">${cards}</div>
    `;
  },

  /** HTML for one room card */
  _cardHTML(room, index) {
    const statusMap = {
      available: { badge:'● Available', badgeClass:'online',  iconBg:'var(--gradient-success)', iconClass:'fa-chalkboard-user', scheduleClass:'color:var(--accent-green)',  btnHTML: this._bookBtn() },
      soon:      { badge:'⚠ Occupied Soon', badgeClass:'warning', iconBg:'var(--gradient-warning)', iconClass:'fa-desktop',         scheduleClass:'color:var(--accent-amber)',  btnHTML: this._quickBookBtn() },
      occupied:  { badge:'● Occupied',   badgeClass:'offline', iconBg:'var(--gradient-danger)',  iconClass:'fa-chalkboard-user', scheduleClass:'color:var(--accent-red)',    btnHTML: this._scheduleBtn() }
    };

    const sm = statusMap[room.status] || statusMap.available;

    const aiPicBadge = room.aiPick
      ? `<div style="position:absolute;top:10px;left:12px;display:inline-flex;align-items:center;
                     gap:4px;background:var(--gradient-primary);color:#fff;font-size:0.6rem;
                     font-weight:700;padding:2px 8px;border-radius:var(--radius-full);
                     letter-spacing:0.05em;z-index:2;box-shadow:0 2px 8px rgba(108,99,255,0.4);">
           <i class="fa-solid fa-brain"></i> AI Pick
         </div>`
      : '';

    const currentClassHTML = room.currentClass
      ? `<div style="font-size:0.8rem;font-weight:600;${sm.scheduleClass};">${room.currentClass}</div>`
      : `<div style="font-size:0.8rem;font-weight:600;color:var(--accent-green);">— No class in progress —</div>`;

    return `
      <article
        class="twin-card cr-stagger-${Math.min(index + 1, 6)}"
        data-room-id="${room.id}"
        data-block="${room.block}"
        data-floor="${room.floor}"
        data-type="${room.type}"
        data-capacity="${room.capacity}"
        data-status="${room.status}"
        ${room.aiPick ? 'data-ai-pick="true"' : ''}
        tabindex="0"
        role="article"
        aria-label="Room ${room.number}, ${room.status === 'available' ? 'Available' : room.status === 'soon' ? 'Occupied Soon' : 'Occupied'}"
        style="--card-gradient:${this._statusGradient(room.status)};position:relative;overflow:hidden;cursor:pointer;">

        <div class="twin-card-bg"></div>
        ${aiPicBadge}
        <span class="twin-status-badge ${sm.badgeClass}"
              style="${room.aiPick ? 'top:30px;' : ''}"
              aria-label="Status: ${sm.badge}">${sm.badge}</span>

        <!-- Icon + Room number -->
        <div style="display:flex;align-items:center;gap:10px;margin-top:${room.aiPick ? '22px' : '6px'};margin-bottom:12px;">
          <div style="width:38px;height:38px;background:${sm.iconBg};border-radius:10px;
                      display:flex;align-items:center;justify-content:center;
                      font-size:16px;color:#fff;flex-shrink:0;
                      box-shadow:0 4px 12px rgba(0,0,0,0.14);
                      transition:transform 0.3s ease;">
            <i class="fa-solid ${sm.iconClass}"></i>
          </div>
          <div>
            <div style="font-size:1.1rem;font-weight:800;color:var(--text-primary);line-height:1;">${room.number}</div>
            <div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px;">${this._typeLabel(room.type)}</div>
          </div>
        </div>

        <!-- Stats -->
        <div class="twin-stats">
          <div class="twin-stat">
            <span class="twin-stat-label"><i class="fa-solid fa-building"></i> Block</span>
            <span class="twin-stat-value">Block ${room.block}</span>
          </div>
          <div class="twin-stat">
            <span class="twin-stat-label"><i class="fa-solid fa-layer-group"></i> Floor</span>
            <span class="twin-stat-value">${this._floorLabel(room.floor)}</span>
          </div>
          <div class="twin-stat">
            <span class="twin-stat-label"><i class="fa-solid fa-users"></i> Capacity</span>
            <span class="twin-stat-value">${room.capacity} seats</span>
          </div>
        </div>

        <!-- Schedule -->
        <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border-color);">
          <div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:3px;font-weight:600;
                      text-transform:uppercase;letter-spacing:0.05em;">
            <i class="fa-solid fa-book-open" style="width:13px;margin-right:3px;"></i>Current Class
          </div>
          ${currentClassHTML}
        </div>
        <div style="margin-top:7px;">
          <div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:3px;font-weight:600;
                      text-transform:uppercase;letter-spacing:0.05em;">
            <i class="fa-solid fa-arrow-right" style="width:13px;margin-right:3px;"></i>Next Class
          </div>
          <div style="font-size:0.8rem;font-weight:500;color:var(--text-secondary);">${room.nextClass}</div>
        </div>
        <div style="margin-top:7px;">
          <div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:2px;font-weight:600;
                      text-transform:uppercase;letter-spacing:0.05em;">
            <i class="fa-solid fa-clock" style="width:13px;margin-right:3px;"></i>Available Until
          </div>
          <div style="font-size:0.82rem;font-weight:700;${sm.scheduleClass};">${room.availableUntil}</div>
        </div>

        <!-- Action button -->
        <div style="margin-top:14px;">${sm.btnHTML}</div>
      </article>
    `;
  },

  _bookBtn() {
    return `<button class="hero-btn hero-btn-primary btn-ripple"
              style="width:100%;padding:9px;font-size:0.78rem;
                     border-radius:var(--radius-sm);justify-content:center;"
              aria-label="Book this room">
              <i class="fa-solid fa-calendar-plus"></i> Book Room
            </button>`;
  },

  _quickBookBtn() {
    return `<button class="hero-btn btn-ripple"
              style="width:100%;padding:9px;font-size:0.78rem;
                     border-radius:var(--radius-sm);justify-content:center;
                     background:var(--gradient-warning);color:#fff;"
              aria-label="Quick book this room">
              <i class="fa-solid fa-bolt"></i> Quick Book
            </button>`;
  },

  _scheduleBtn() {
    return `<button class="tab-btn"
              style="width:100%;padding:9px;font-size:0.78rem;
                     border-radius:var(--radius-sm);
                     display:flex;align-items:center;justify-content:center;gap:6px;"
              aria-label="View schedule for this room">
              <i class="fa-solid fa-calendar"></i> View Schedule
            </button>`;
  },

  _statusGradient(status) {
    const map = {
      available: 'linear-gradient(135deg,#10B981,#34D399)',
      soon:      'linear-gradient(135deg,#F59E0B,#FBBF24)',
      occupied:  'linear-gradient(135deg,#EF4444,#F87171)'
    };
    return map[status] || map.available;
  },

  _typeLabel(type) {
    const map = {
      lecture:    'Lecture Hall',
      seminar:    'Seminar Room',
      lab:        'Computer Lab',
      tutorial:   'Tutorial Room',
      conference: 'Conference Room'
    };
    return map[type] || type;
  },

  _floorLabel(floor) {
    if (floor === 'G') return 'Ground Floor';
    return 'Floor ' + floor;
  },

  /** Empty state when no rooms match */
  _emptyStateHTML() {
    return `
      <div style="text-align:center;padding:60px 20px;color:var(--text-muted);">
        <div style="font-size:3rem;margin-bottom:16px;opacity:0.4;">🏫</div>
        <div style="font-size:1rem;font-weight:700;color:var(--text-primary);margin-bottom:8px;">
          No rooms match your filters
        </div>
        <div style="font-size:0.85rem;">
          Try adjusting the filters or clearing the search.
        </div>
        <button class="tab-btn"
                style="margin-top:20px;display:inline-flex;align-items:center;gap:6px;"
                onclick="FilterManager.clearAll()">
          <i class="fa-solid fa-rotate"></i> Clear All Filters
        </button>
      </div>
    `;
  },

  /** Apply stagger fade-up to every newly inserted card */
  _animateCards(container) {
    const cards = container.querySelectorAll('.twin-card');
    cards.forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(16px)';
      card.style.transition = 'none';
      requestAnimationFrame(() => {
        setTimeout(() => {
          card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          card.style.opacity    = '1';
          card.style.transform  = 'translateY(0)';
        }, i * 55);          // 55ms stagger between cards
      });
    });
  }
};
/* ============================================================
   8. AI RECOMMENDATION MANAGER
   Animates the confidence bar on load and highlights the
   AI-recommended room card when it appears in the grid.
   ============================================================ */
const AIRecommendation = {
  /** Animate all .confidence-fill bars to their target width */
  animateConfidenceBars() {
    document.querySelectorAll('.confidence-fill').forEach((bar) => {
      const target = bar.style.width || '0%';
      bar.style.width = '0%';
      requestAnimationFrame(() => {
        setTimeout(() => { bar.style.width = target; }, 50);
      });
    });
  },

  /**
   * Pulse-highlight the AI-pick card in the grid so users
   * can visually connect it to the recommendation panel.
   */
  highlightAIPick() {
    const aiCards = document.querySelectorAll('[data-ai-pick="true"]');
    aiCards.forEach((card) => {
      /* Add a temporary glow ring animation */
      card.style.transition = 'box-shadow 0.4s ease';
      card.style.boxShadow  = '0 0 0 3px rgba(108,99,255,0.5), 0 8px 28px rgba(108,99,255,0.3)';
      setTimeout(() => {
        card.style.boxShadow = '';
      }, 2200);
    });
  },

  /**
   * Scroll AI-pick card into view and pulse it
   * when the "New Suggestion" button is clicked.
   */
  initNewSuggestionBtn() {
    const btn = document.querySelector('[data-action="new-suggestion"]');
    if (!btn) return;
    btn.addEventListener('click', () => {
      btn.innerHTML = '<span class="lp-spinner" style="width:14px;height:14px;border-width:2px;"></span> Finding…';
      btn.disabled = true;
      setTimeout(() => {
        btn.innerHTML = '<i class="fa-solid fa-rotate"></i> New Suggestion';
        btn.disabled = false;
        this.highlightAIPick();
        /* Scroll to the AI-pick card */
        const pick = document.querySelector('[data-ai-pick="true"]');
        if (pick) pick.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 1400);
    });
  },

  init() {
    this.animateConfidenceBars();
    this.highlightAIPick();
    this.initNewSuggestionBtn();
  }
};


/* ============================================================
   9. CARD INTERACTION MANAGER
   Hover micro-animations and click handlers for Book / Schedule.
   Called after every grid re-render.
   ============================================================ */
const CardInteraction = {
  init() {
    this._bindHover();
    this._bindButtons();
    this._bindKeyboard();
  },

  /** Icon rotate on card hover (CSS already handles lift via twin-card:hover) */
  _bindHover() {
    document.querySelectorAll('.twin-card').forEach((card) => {
      const icon = card.querySelector('[style*="border-radius:10px"]');

      card.addEventListener('mouseenter', () => {
        if (icon) {
          icon.style.transform = 'scale(1.1) rotate(-4deg)';
          icon.style.transition = 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)';
        }
      });
      card.addEventListener('mouseleave', () => {
        if (icon) icon.style.transform = '';
      });
    });
  },

  /** Book Room / Quick Book / View Schedule click feedback */
  _bindButtons() {
    document.querySelectorAll('.twin-card button').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();          // prevent card click
        const label = btn.textContent.trim();

        if (label.includes('Book') || label.includes('Quick')) {
          this._showBookingFeedback(btn);
        } else if (label.includes('Schedule')) {
          this._showScheduleFeedback(btn);
        }
      });
    });
  },

  /** Simulate booking with spinner, then success */
  _showBookingFeedback(btn) {
    const original = btn.innerHTML;
    btn.innerHTML  = '<span style="display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:crLoader 0.7s linear infinite;vertical-align:middle;margin-right:6px;"></span> Booking…';
    btn.disabled   = true;

    setTimeout(() => {
      btn.innerHTML  = '<i class="fa-solid fa-check"></i> Booked!';
      btn.style.background = 'var(--gradient-success)';
      setTimeout(() => {
        btn.innerHTML  = original;
        btn.style.background = '';
        btn.disabled   = false;
      }, 2000);
    }, 1200);
  },

  /** Brief highlight on schedule button */
  _showScheduleFeedback(btn) {
    const original = btn.style.cssText;
    btn.style.borderColor = 'var(--accent-purple)';
    btn.style.color       = 'var(--accent-purple)';
    setTimeout(() => { btn.style.cssText = original; }, 800);
  },

  /** Space/Enter activates focused card */
  _bindKeyboard() {
    document.querySelectorAll('.twin-card[tabindex="0"]').forEach((card) => {
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const btn = card.querySelector('button');
          if (btn) btn.click();
        }
      });
    });
  }
};


/* ============================================================
   10. LOAD MORE MANAGER
   Handles the "Load More" button at the bottom of the grid.
   In a real app this would paginate an API; here it shows
   a loading animation then a "no more rooms" message.
   ============================================================ */
const LoadMoreManager = {
  _btn: null,
  _clickCount: 0,

  init() {
    this._btn = document.querySelector('[aria-label="Load more classrooms"]');
    if (!this._btn) return;

    this._btn.addEventListener('click', () => {
      this._clickCount++;
      this._simulateLoad();
    });
  },

  _simulateLoad() {
    const btn = this._btn;
    const original = btn.innerHTML;

    btn.innerHTML = '<span style="display:inline-block;width:14px;height:14px;border:2px solid var(--border-color);border-top-color:var(--accent-purple);border-radius:50%;animation:crLoader 0.7s linear infinite;margin-right:6px;vertical-align:middle;"></span> Loading…';
    btn.disabled = true;

    setTimeout(() => {
      if (this._clickCount >= 2) {
        /* All rooms loaded */
        btn.innerHTML = '<i class="fa-solid fa-check"></i> All rooms loaded';
        btn.style.opacity = '0.5';
        btn.disabled = true;
      } else {
        btn.innerHTML = original;
        btn.disabled  = false;
        /* Update the count label */
        const remaining = Math.max(0, 96 - this._clickCount * 48);
        btn.innerHTML = `<i class="fa-solid fa-arrows-rotate"></i> Load More Rooms (${remaining} remaining)`;
      }
    }, 1000);
  }
};


/* ============================================================
   11. LIVE CLOCK
   Updates topbar date every minute so it stays accurate.
   ============================================================ */
const LiveClock = {
  init() {
    /* Update immediately, then every 60 s */
    this._update();
    setInterval(() => this._update(), 60000);
  },

  _update() {
    const el = document.getElementById('topbarDate');
    if (!el) return;
    const now  = new Date();
    const opts = { weekday:'short', month:'short', day:'numeric', year:'numeric' };
    el.textContent = now.toLocaleDateString('en-IN', opts);
  }
};


/* ============================================================
   12. RIPPLE EFFECT
   Adds a CSS ripple animation on every .btn-ripple element.
   ============================================================ */
const RippleEffect = {
  init() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-ripple');
      if (!btn) return;

      /* Remove existing ripple spans */
      btn.querySelectorAll('.ripple-span').forEach(s => s.remove());

      const rect   = btn.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height) * 1.8;
      const x      = e.clientX - rect.left - size / 2;
      const y      = e.clientY - rect.top  - size / 2;

      const span = document.createElement('span');
      span.className = 'ripple-span';
      span.style.cssText = `
        position:absolute;
        width:${size}px; height:${size}px;
        top:${y}px; left:${x}px;
        background:rgba(255,255,255,0.25);
        border-radius:50%;
        transform:scale(0);
        animation:ripple-anim 0.55s ease-out forwards;
        pointer-events:none;
      `;

      /* Ensure parent is relative */
      const pos = window.getComputedStyle(btn).position;
      if (pos === 'static') btn.style.position = 'relative';
      btn.style.overflow = 'hidden';
      btn.appendChild(span);
      setTimeout(() => span.remove(), 600);
    });

    /* One-time keyframe injection */
    if (!document.getElementById('rippleStyle')) {
      const style = document.createElement('style');
      style.id = 'rippleStyle';
      style.textContent = `
        @keyframes ripple-anim {
          to { transform: scale(1); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }
};


/* ============================================================
   13. CLASSROOM SECTION SETUP
   Wraps the dynamic grid section in a container the GridManager
   can target, and does the first render with all rooms.
   ============================================================ */
const ClassroomSection = {
  init() {
    /* Find or create the dynamic section container */
    let section = document.getElementById('classroomSection');

    if (!section) {
      /*
       * The static HTML has block headers and grids hard-coded.
       * We find the first digital-twin-grid's parent section
       * and wrap everything from the "Block A" sub-header down.
       */
      const grid = document.getElementById('classroomGridA');
      if (grid) {
        /* Walk up to the <section> containing the grids */
        section = grid.closest('section');
        if (section) section.id = 'classroomSection';
      }
    }

    /* Initial render: all rooms, no filters */
    if (section) {
      GridManager.render(ClassroomData.getAll());
    }
  }
};


/* ============================================================
   BOOT — Initialize all modules in correct order
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  /* 1. Theme must apply before paint to avoid flash */
  ThemeManager.init();

  /* 2. Layout & navigation */
  SidebarManager.init();
  TopbarManager.init();
  LiveClock.init();

  /* 3. Grid & data */
  GridManager.init();
  ClassroomSection.init();

  /* 4. Search & filters (depend on GridManager being ready) */
  SearchManager.init();
  FilterManager.init();

  /* 5. UI enhancements */
  AIRecommendation.init();
  LoadMoreManager.init();
  RippleEffect.init();

  /* 6. Card interactions (re-run after every render via GridManager) */
  CardInteraction.init();

  console.log('✓ CampusPulse AI – Classroom module initialised');
});