/**
 * Smart Dining - Analytics View JavaScript
 */

let attendanceChart, ratingChart, wasteChart;

// Load analytics on page load
document.addEventListener('DOMContentLoaded', function() {
    loadAnalytics(7); // Default 7 days
    
    // Period selector change
    document.getElementById('analytics-period').addEventListener('change', function() {
        const days = parseInt(this.value);
        loadAnalytics(days);
    });
});

/**
 * Load analytics data
 */
async function loadAnalytics(days = 7) {
    try {
        const response = await fetch(`/dining/api/analytics?days=${days}`);
        const result = await response.json();
        
        if (result.success) {
            updateStats(result.data);
            updateCharts(result.data);
        } else {
            showNotification('Error loading analytics', 'error');
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
        showNotification('Error loading analytics', 'error');
    }
}

/**
 * Update statistics cards
 */
function updateStats(data) {
    document.getElementById('stat-rating').textContent = data.average_rating.toFixed(1);
    document.getElementById('stat-meals').textContent = data.total_meals_served.toLocaleString();
    document.getElementById('stat-waste').textContent = `${data.total_food_waste} kg`;
    document.getElementById('stat-satisfaction').textContent = `${data.student_satisfaction}%`;
}

/**
 * Update charts
 */
function updateCharts(data) {
    // Get theme colors
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#F9FAFB' : '#1F2937';
    const gridColor = isDark ? '#374151' : '#E5E7EB';
    
    // Chart.js default configuration
    const chartDefaults = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColor
                },
                grid: {
                    color: gridColor,
                    display: false
                }
            },
            y: {
                ticks: {
                    color: textColor
                },
                grid: {
                    color: gridColor
                }
            }
        }
    };
    
    // Daily Attendance Chart
    if (attendanceChart) {
        attendanceChart.destroy();
    }
    
    const attendanceCtx = document.getElementById('attendanceChart').getContext('2d');
    attendanceChart = new Chart(attendanceCtx, {
        type: 'bar',
        data: {
            labels: data.daily_attendance.map(item => formatChartDate(item.date)),
            datasets: [{
                label: 'Meals Served',
                data: data.daily_attendance.map(item => item.count),
                backgroundColor: 'rgba(124, 92, 255, 0.2)',
                borderColor: '#7C5CFF',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            ...chartDefaults,
            scales: {
                ...chartDefaults.scales,
                y: {
                    ...chartDefaults.scales.y,
                    beginAtZero: true,
                    ticks: {
                        ...chartDefaults.scales.y.ticks,
                        stepSize: 50
                    }
                }
            }
        }
    });
    
    // Rating Trend Chart
    if (ratingChart) {
        ratingChart.destroy();
    }
    
    const ratingCtx = document.getElementById('ratingChart').getContext('2d');
    ratingChart = new Chart(ratingCtx, {
        type: 'line',
        data: {
            labels: data.rating_trend.map(item => formatChartDate(item.date)),
            datasets: [{
                label: 'Average Rating',
                data: data.rating_trend.map(item => item.rating),
                backgroundColor: 'rgba(27, 207, 180, 0.1)',
                borderColor: '#1BCFB4',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#1BCFB4',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            ...chartDefaults,
            scales: {
                ...chartDefaults.scales,
                y: {
                    ...chartDefaults.scales.y,
                    beginAtZero: false,
                    min: 0,
                    max: 5,
                    ticks: {
                        ...chartDefaults.scales.y.ticks,
                        stepSize: 1
                    }
                }
            }
        }
    });
    
    // Food Waste Chart
    if (wasteChart) {
        wasteChart.destroy();
    }
    
    const wasteCtx = document.getElementById('wasteChart').getContext('2d');
    wasteChart = new Chart(wasteCtx, {
        type: 'line',
        data: {
            labels: data.waste_trend.map(item => formatChartDate(item.date)),
            datasets: [{
                label: 'Food Waste (kg)',
                data: data.waste_trend.map(item => item.waste),
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderColor: '#EF4444',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#EF4444',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            ...chartDefaults,
            scales: {
                ...chartDefaults.scales,
                y: {
                    ...chartDefaults.scales.y,
                    beginAtZero: true
                }
            }
        }
    });
}

/**
 * Format date for chart labels
 */
function formatChartDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Export analytics as CSV
 */
async function exportAnalytics() {
    try {
        const days = parseInt(document.getElementById('analytics-period').value);
        window.location.href = `/dining/api/analytics/export?days=${days}`;
    } catch (error) {
        console.error('Error exporting analytics:', error);
        showNotification('Error exporting analytics', 'error');
    }
}

/**
 * Update charts on theme change
 */
document.addEventListener('DOMContentLoaded', function() {
    // Watch for theme changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'data-theme') {
                const days = parseInt(document.getElementById('analytics-period').value);
                loadAnalytics(days);
            }
        });
    });
    
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
    });
});

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    alert(message);
}
