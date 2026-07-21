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