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
const trendCtx = document.getElementById('trendChart');

if (trendCtx) {

    new Chart(trendCtx, {

        type: 'line',

        data: {

            labels: trendLabels,

            datasets: [{

                label: 'Daily Complaints',

                data: trendValues,

                fill: false,

                tension: 0.3

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
/* ============================
   AI Live Recommendation Feed
============================ */

const aiMessages = [

"Open Study Hall B to reduce library crowding.",

"High cafeteria demand predicted at 1 PM.",

"Schedule maintenance for Hostel A tomorrow.",

"Wi-Fi usage is expected to spike after 6 PM.",

"Electricity consumption may increase in Block C."

];

let aiIndex = 0;

setInterval(() => {

const msg = document.getElementById("aiMessage");

if(msg){

aiIndex = (aiIndex + 1) % aiMessages.length;

msg.innerHTML = aiMessages[aiIndex];

}

},4000);
/* ============================
   LIVE ALERT ROTATOR
============================ */

const alerts = [

"🟢 Campus operating normally",

"⚠ High cafeteria crowd expected",

"📶 Wi-Fi traffic increasing in Block C",

"💧 Water usage higher than usual",

"🔧 Maintenance request pending in Hostel A"

];

let alertIndex = 0;

setInterval(() => {

const alertBox = document.getElementById("alertFeed");

if(alertBox){

alertIndex = (alertIndex + 1) % alerts.length;

alertBox.innerHTML = `<div class="alert-item">${alerts[alertIndex]}</div>`;

}

},5000);