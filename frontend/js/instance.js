document.addEventListener("DOMContentLoaded", async () => {
    const instanceId = window.location.search.split('id=')[1];

    try {
        const response = await fetch(`/instance/view/${instanceId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to fetch instance data');
        }

        const {
            data,
            statistics,
            page
        } = await response.json();
        if (!data || data.length === 0) {
            document.body.innerHTML = "<p>No data available for this instance.</p>";
            return;
        }

        document.querySelector(".statistics-panel h2").innerHTML = statistics.instanceName;
        document.querySelector(".statistics-panel p").innerHTML = document.querySelector(".statistics-panel p").innerHTML.replace("{total_entries}", statistics.totalEntries).replace("{unique_clients}", statistics.uniqueClients);

        // Container helper function
        const createChartContainer = () => {
            const div = document.createElement('div');
            div.className = 'chart-container';
            div.style.width = '80%';
            div.style.maxWidth = '800px';
            div.style.margin = '40px auto';
            div.style.backgroundColor = '#1e1e1e';
            div.style.padding = '20px';
            div.style.borderRadius = '12px';
            div.style.boxShadow = '0 0 20px rgba(0,0,0,0.5)';
            document.body.appendChild(div);
            const canvas = document.createElement('canvas');
            div.appendChild(canvas);
            return canvas;
        };

        // page is an array of charts/graphs to display
        // each "element" is something like {type: 'line', title: 'Version Over Time', x: 'timestamp', y: 'version'
        // {type: 'pie', title: 'OS Distribution', labels: [...], data: [...]}


        page.forEach(chartDef => {
            const canvas = createChartContainer();

            const chartConfig = {
                type: chartDef.type,
                data: {},
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            labels: {
                                color: '#e0e0e0'
                            }
                        },
                        title: {
                            display: true,
                            text: chartDef.title || '',
                            color: '#e0e0e0'
                        }
                    },
                    scales: {}
                }
            };

            // example output
            //          "page": [
            //     {
            //         "type": "line",
            //         "title": "JAVAVERSION Distribution",
            //         "labels": [
            //             "22",
            //             "21"
            //         ],
            //         "data": [
            //             2,
            //             2
            //         ],
            //         "dataField": "javaVersion",
            //         "x": [
            //             1764418227000,
            //             1763721332000
            //         ]
            //     },
            //     {
            //         "type": "pie",
            //         "title": "OPERATING SYSTEM Distribution",
            //         "labels": [
            //             null,
            //             "Windows 11"
            //         ],
            //         "data": [
            //             2,
            //             2
            //         ],
            //         "dataField": "operating_system",
            //         "x": [
            //             1764418227000,
            //             1763721332000
            //         ]
            //     }
            // ]

            if (chartDef.type === 'line') {
                chartConfig.data.labels = [];

                const chartData = chartDef.x.map((timestamp, index) => ({
                    x: timestamp,
                    y: chartDef.labels[index] || 0
                }));

                chartConfig.data.datasets = [{
                    label: chartDef.dataField || chartDef.title || 'Value Over Time',
                    data: chartData,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: false,
                    tension: 0.3
                }];

                chartConfig.options.scales = {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day',
                            tooltipFormat: 'MMM D, YYYY h:mm a'
                        },
                        ticks: {
                            color: '#e0e0e0'
                        }
                    },
                    y: {
                        ticks: {
                            color: '#e0e0e0'
                        },
                        beginAtZero: true
                    }
                };
            } else if (chartDef.type === 'bar') {
                chartConfig.data.labels = chartDef.labels || [];
                chartConfig.data.datasets = [{
                    label: chartDef.title || '',
                    data: chartDef.data || [],
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }];

                chartConfig.options.scales = {
                    x: {
                        ticks: {
                            color: '#e0e0e0'
                        }
                    },
                    y: {
                        ticks: {
                            color: '#e0e0e0'
                        },
                        beginAtZero: true
                    }
                };
            } else if (chartDef.type === 'pie') {
                chartConfig.data.labels = chartDef.labels || [];
                chartConfig.data.datasets = [{
                    label: chartDef.title || '',
                    data: chartDef.data || [],
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                        '#FF9F40', '#C9CBCF', '#8E44AD', '#2ECC71', '#E74C3C'
                    ]
                }];
            }

            new Chart(canvas, chartConfig);
        });
    } catch (err) {
        console.error(err);
        document.body.innerHTML += `<p>Error: ${err.message}</p>`;
    }
});