const ctx = document.getElementById('complaintChart');

if (ctx) {

    new Chart(ctx, {

        type: 'pie',

        data: {

            labels: ['Pending', 'Resolved'],

            datasets: [{

                data: [pendingComplaints, resolvedComplaints],

                borderWidth: 1

            }]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {

                    position: 'bottom'

                }

            }

        }

    });

}
const categoryCtx = document.getElementById('categoryChart');

if (categoryCtx) {

    new Chart(categoryCtx, {

        type: 'bar',

        data: {

            labels: categoryLabels,

            datasets: [{

                label: 'Complaints',

                data: categoryValues,

                borderWidth: 1

            }]

        },

        options: {

            responsive: true,

            scales: {

                y: {

                    beginAtZero: true

                }

            }

        }

    });

}