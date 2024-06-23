document.addEventListener('DOMContentLoaded', () => {
    const speedDisplay = document.getElementById('speed-display');
    const statusDisplay = document.getElementById('status-display');
    const speedCtx = document.getElementById('speedChart').getContext('2d');
    const statusCtx = document.getElementById('statusChart').getContext('2d');
    const THINGSPEAK_API_KEY = 'PZWVG5E7AWFWPIHN';
    const THINGSPEAK_CHANNEL_ID = '2580401';
    let speedChart, statusChart;
    let speedData = [];
    let statusData = [];

    async function fetchData() {
        const response = await fetch(`https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/fields/1.json?api_key=${THINGSPEAK_API_KEY}&results=10`);
        const data = await response.json();
        const feeds = data.feeds;

        if (feeds.length > 0) {
            const lastEntry = feeds[feeds.length - 1];
            const motorSpeed = lastEntry.field1;
            const motorStatus = motorSpeed > 0 ? 'Running' : 'Stopped';

            speedDisplay.textContent = `${motorSpeed}%`;
            statusDisplay.textContent = motorStatus;

            // Update the charts
            updateSpeedChart(feeds.map(feed => parseFloat(feed.field1)));
            updateStatusChart(feeds.map(feed => feed.field1 > 0 ? 'Running' : 'Stopped'));
        }
    }

    function updateSpeedChart(data) {
        if (speedChart) {
            speedChart.destroy();
        }
        speedChart = new Chart(speedCtx, {
            type: 'line',
            data: {
                labels: Array.from({ length: data.length }, (_, i) => `Data ${i + 1}`),
                datasets: [{
                    label: 'Motor Speed (%)',
                    data: data,
                    borderColor: 'rgba(75, 192, 192, 1)', // Green
                    backgroundColor: 'rgba(75, 192, 192, 0.2)', // Green with transparency
                    borderWidth: 2
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function updateStatusChart(data) {
        if (statusChart) {
            statusChart.destroy();
        }
        statusChart = new Chart(statusCtx, {
            type: 'bar',
            data: {
                labels: Array.from({ length: data.length }, (_, i) => `Data ${i + 1}`),
                datasets: [{
                    label: 'Motor Status',
                    data: data.map(status => status === 'Running' ? 1 : 0),
                    backgroundColor: 'rgba(255, 99, 132, 0.2)', // Red with transparency
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => value === 1 ? 'Running' : 'Stopped'
                        }
                    }
                }
            }
        });
    }

    fetchData();
    setInterval(fetchData, 5000); // Fetch data every 5 seconds
});
