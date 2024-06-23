document.addEventListener('DOMContentLoaded', () => {
    const dutyCycleDisplay = document.getElementById('duty-cycle-display');
    const voltageDisplay = document.getElementById('voltage-display');
    const speedDisplay = document.getElementById('speed-display');
    const motorStateDisplay = document.getElementById('motor-state-display');

    const dutyCycleCtx = document.getElementById('dutyCycleChart').getContext('2d');
    const voltageCtx = document.getElementById('voltageChart').getContext('2d');
    const speedCtx = document.getElementById('speedChart').getContext('2d');
    const motorStateCtx = document.getElementById('motorStateChart').getContext('2d');

    const THINGSPEAK_API_KEY = 'PZWVG5E7AWFWPIHN';
    const THINGSPEAK_CHANNEL_ID = '2580401';

    let dutyCycleChart, voltageChart, speedChart, motorStateChart;

    async function fetchData() {
        const response = await fetch(`https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/feeds.json?api_key=${THINGSPEAK_API_KEY}&results=10`);
        const data = await response.json();
        const feeds = data.feeds;

        if (feeds.length > 0) {
            const lastEntry = feeds[feeds.length - 1];
            const dutyCycle = parseFloat(lastEntry.field1);
            const voltage = parseFloat(lastEntry.field2);
            const speed = parseFloat(lastEntry.field3);
            const motorState = parseInt(lastEntry.field4);

            dutyCycleDisplay.textContent = `${dutyCycle}%`;
            voltageDisplay.textContent = `${voltage}V`;
            speedDisplay.textContent = `${speed} RPM`;
            motorStateDisplay.textContent = motorState === 1 ? 'Clockwise' : motorState === 2 ? 'Anticlockwise' : 'Stopped';

            // Update the charts
            updateDutyCycleChart(feeds.map(feed => parseFloat(feed.field1)));
            updateVoltageChart(feeds.map(feed => parseFloat(feed.field2)));
            updateSpeedChart(feeds.map(feed => parseFloat(feed.field3)));
            updateMotorStateChart(feeds.map(feed => parseInt(feed.field4)));
        }
    }

    function updateDutyCycleChart(data) {
        if (dutyCycleChart) dutyCycleChart.destroy();
        dutyCycleChart = new Chart(dutyCycleCtx, {
            type: 'line',
            data: {
                labels: Array.from({ length: data.length }, (_, i) => `Data ${i + 1}`),
                datasets: [{
                    label: 'Duty Cycle (%)',
                    data: data,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
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

    function updateVoltageChart(data) {
        if (voltageChart) voltageChart.destroy();
        voltageChart = new Chart(voltageCtx, {
            type: 'bar',
            data: {
                labels: Array.from({ length: data.length }, (_, i) => `Data ${i + 1}`),
                datasets: [{
                    label: 'Voltage (V)',
                    data: data,
                    borderColor: 'rgba(255, 159, 64, 1)',
                    backgroundColor: 'rgba(255, 159, 64, 0.2)',
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

    function updateSpeedChart(data) {
        if (speedChart) speedChart.destroy();
        speedChart = new Chart(speedCtx, {
            type: 'line',
            data: {
                labels: Array.from({ length: data.length }, (_, i) => `Data ${i + 1}`),
                datasets: [{
                    label: 'Speed (RPM)',
                    data: data,
                    borderColor: 'rgba(153, 102, 255, 1)',
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
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

    function updateMotorStateChart(data) {
        if (motorStateChart) motorStateChart.destroy();
        motorStateChart = new Chart(motorStateCtx, {
            type: 'bar',
            data: {
                labels: Array.from({ length: data.length }, (_, i) => `Data ${i + 1}`),
                datasets: [{
                    label: 'Motor State',
                    data: data.map(state => state === 1 ? 1 : state === 2 ? 2 : 0),
                    backgroundColor: 'rgba(255, 206, 86, 0.2)', // Yellow with transparency
                    borderColor: 'rgba(255, 206, 86, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                if (value === 1) return 'Clockwise';
                                if (value === 2) return 'Anticlockwise';
                                return 'Stopped';
                            }
                        }
                    }
                }
            }
        });
    }

    fetchData();
    setInterval(fetchData, 5000); // Fetch data every 5 seconds
});
