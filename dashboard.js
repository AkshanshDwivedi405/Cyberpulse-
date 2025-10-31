// Global variables for charts
let protocolBarChart = null;
let packetFlowChart = null;
let packetHistory = [];
const MAX_HISTORY_POINTS = 10;

// Utility functions
function formatBytes(bytes) {
    if (bytes === 0) return '[0 B]';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `[${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}]`;
}

function getCyberColor(protocol) {
    const colors = {
        'TCP': '#00fff2',
        'UDP': '#ff00e6',
        'ICMP': '#ffff00',
        'HTTP': '#00ff95',
        'HTTPS': '#ff3300',
        'DNS': '#9D00FF'
    };
    return colors[protocol] || '#00fff2';
}

// Initialize charts when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing charts...');
    initializeCharts();
    startDataUpdates();
});

function initializeCharts() {
    try {
        // Initialize Packet Flow Chart
        const packetCtx = document.getElementById('packet-flow-chart');
        if (packetCtx) {
            const gradient = packetCtx.getContext('2d').createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, 'rgba(0, 255, 255, 0.2)');
            gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');

            packetFlowChart = new Chart(packetCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Network Traffic',
                        data: [],
                        borderColor: '#00fff2',
                        backgroundColor: gradient,
                        borderWidth: 3,
                        tension: 0.3,
                        fill: true,
                        pointRadius: 4,
                        pointBackgroundColor: '#00fff2',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointHoverRadius: 6,
                        pointHoverBackgroundColor: '#ffffff',
                        pointHoverBorderColor: '#00fff2',
                        pointHoverBorderWidth: 2,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 750,
                        easing: 'easeInOutQuart'
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0, 255, 255, 0.1)',
                                drawBorder: false
                            },
                            ticks: {
                                color: '#00fff2',
                                font: {
                                    family: "'Space Mono', monospace",
                                    size: 12
                                },
                                callback: function(value) {
                                    return formatBytes(value);
                                }
                            }
                        },
                        x: {
                            grid: {
                                color: 'rgba(0, 255, 255, 0.1)',
                                drawBorder: false
                            },
                            ticks: {
                                color: '#00fff2',
                                font: {
                                    family: "'Space Mono', monospace",
                                    size: 12
                                }
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#00fff2',
                            bodyColor: '#ffffff',
                            borderColor: '#00fff2',
                            borderWidth: 1,
                            padding: 12,
                            displayColors: false,
                            callbacks: {
                                label: function(context) {
                                    return 'Traffic: ' + formatBytes(context.parsed.y);
                                }
                            }
                        }
                    }
                }
            });
            console.log('Packet Flow Chart initialized');
        }

        // Initialize Protocol Bar Chart
        const protocolCtx = document.getElementById('protocol-bar-chart');
        if (protocolCtx) {
            protocolBarChart = new Chart(protocolCtx, {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        data: [],
                        backgroundColor: [],
                        borderWidth: 1,
                        // Make each horizontal bar thinner so many can fit vertically
                        barThickness: 12,
                        maxBarThickness: 16,
                        categoryPercentage: 0.9,
                        barPercentage: 0.85
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: {
                        padding: {
                            top: 6,
                            bottom: 6,
                            left: 6,
                            right: 6
                        }
                    },
                    scales: {
                        x: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#0ff',
                                font: {
                                    family: "'Space Mono', monospace",
                                    size: 11
                                }
                            }
                        },
                        y: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                color: '#0ff',
                                // smaller font to allow more labels to fit
                                font: {
                                    family: "'Space Mono', monospace",
                                    size: 11
                                },
                                // ensure labels are not auto-skipped so all protocols show
                                autoSkip: false
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
            console.log('Protocol Bar Chart initialized');
        }
    } catch (error) {
        console.error('Error initializing charts:', error);
    }
}

function updatePacketFlowChart(data) {
    try {
        if (!packetFlowChart) return;

        const totalBytes = data.reduce((sum, entry) => sum + entry.bytes, 0);
        const timestamp = data[0].timestamp;
        
        packetHistory.push({ timestamp, bytes: totalBytes });
        if (packetHistory.length > MAX_HISTORY_POINTS) {
            packetHistory.shift();
        }

        packetFlowChart.data.labels = packetHistory.map(p => p.timestamp);
        packetFlowChart.data.datasets[0].data = packetHistory.map(p => p.bytes);
        packetFlowChart.update();
        console.log('Packet Flow Chart updated');
    } catch (error) {
        console.error('Error updating packet flow chart:', error);
    }
}

function updateProtocolChart(data) {
    try {
        if (!protocolBarChart) return;

        const protocolCounts = {};
        data.forEach(entry => {
            protocolCounts[entry.protocol] = (protocolCounts[entry.protocol] || 0) + 1;
        });

        const protocols = Object.keys(protocolCounts);

        protocolBarChart.data.labels = protocols;
        protocolBarChart.data.datasets[0].data = protocols.map(p => protocolCounts[p]);
        protocolBarChart.data.datasets[0].backgroundColor = protocols.map(p => getCyberColor(p));
        protocolBarChart.update();
        console.log('Protocol Bar Chart updated');
    } catch (error) {
        console.error('Error updating protocol chart:', error);
    }
}

function updateTrafficTable(data) {
    try {
        const tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th><i class="fas fa-clock"></i> TIME</th>
                        <th><i class="fas fa-arrow-right"></i> SOURCE</th>
                        <th><i class="fas fa-arrow-left"></i> DESTINATION</th>
                        <th><i class="fas fa-exchange-alt"></i> PROTOCOL</th>
                        <th><i class="fas fa-database"></i> SIZE</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(entry => `
                        <tr>
                            <td><span class="cyber-text">${entry.timestamp}</span></td>
                            <td><span class="cyber-text">${entry.src_ip}</span></td>
                            <td><span class="cyber-text">${entry.dst_ip}</span></td>
                            <td><span class="protocol-badge" style="border-color: ${getCyberColor(entry.protocol)}; color: ${getCyberColor(entry.protocol)}">${entry.protocol}</span></td>
                            <td><span class="cyber-text">${formatBytes(entry.bytes)}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        document.getElementById('traffic-data').innerHTML = tableHTML;
        console.log('Traffic table updated');
    } catch (error) {
        console.error('Error updating traffic table:', error);
    }
}

function updateSuggestions() {
    fetch('/suggestions')
        .then(response => response.json())
        .then(data => {
            const alertClass = data.suggestion.toLowerCase().includes('anomalies') ? 'alert-info' : 'alert-warning';
            const icon = data.suggestion.toLowerCase().includes('anomalies') ? 'fa-check-circle' : 'fa-exclamation-triangle';
            
            const suggestionsHTML = `
                <div class="alert ${alertClass}">
                    <i class="fas ${icon}"></i>
                    <div>
                        <strong>[TRAFFIC_VOLUME]</strong> ${formatBytes(data.total_traffic)}<br>
                        <strong>[SYSTEM_STATUS]</strong> ${data.suggestion}
                    </div>
                </div>
            `;
            document.getElementById('suggestions').innerHTML = suggestionsHTML;
            document.getElementById('total-traffic-stat').textContent = formatBytes(data.total_traffic) + '/s';
            
            const threatLevel = data.suggestion.toLowerCase().includes('anomalies') ? 'DEFCON 5' : 'DEFCON 3';
            const threatElement = document.getElementById('threat-level');
            if (threatElement) {
                threatElement.textContent = threatLevel;
                threatElement.style.color = threatLevel === 'DEFCON 5' ? '#0ff' : '#ff0';
            }
        })
        .catch(error => console.error('Error updating suggestions:', error));
}

function startDataUpdates() {
    // Function to update all data
    function updateAllData() {
        console.log('Fetching new data...');
        fetch('/traffic-data')
            .then(response => response.json())
            .then(data => {
                updateTrafficTable(data);
                updateProtocolChart(data);
                updatePacketFlowChart(data);
            })
            .catch(error => console.error('Error fetching traffic data:', error));
        updateSuggestions();
    }

    // Initial update
    updateAllData();
    
    // Update every 5 seconds
    setInterval(updateAllData, 5000);
}