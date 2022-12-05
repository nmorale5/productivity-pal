import { Chart } from '../../node_modules/chart.js/auto/auto.js'

/**
 * Doughnut Chart: Displays percentage of time spent productive vs unproductive (ignoring inactivity?)
 * Scatter Chart: Displays timeline of productive vs unproductive sites visited
 * Pie Chart: Displays top 5 most commonly visited sites?
 */

async function SetupCharts() {
    let { history, productive } = await chrome.storage.local.get(["history", "productive"])
    let doughnutData = GetDoughnutChartData(history, productive)
    DisplayDoughnutChart(doughnutData)
}

function GetDoughnutChartData(history, productive) {
    let prodTime = 0
    let unprodTime = 0
    // skip last data point for now to make life easier
    for (let i = 0; i < history.length - 1; i++) {
        let deltaTime = (history[i+1].time - history[i].time) / 1000 / 60
        if (productive[history[i].url] === true) {
            prodTime += deltaTime
        } if (productive[history[i].url] === false) {
            unprodTime += deltaTime
        } // ignore if productive is undefined
    }
    return [prodTime, unprodTime]
}

function DisplayDoughnutChart(doughnutData) {
    new Chart(
        document.getElementById('doughnut-chart'),
        {
            type: 'doughnut',
            data: {
                labels: ['Productive', 'Unproductive'],
                datasets: [{
                    label: "Minutes Spent",
                    data: doughnutData,
                    backgroundColor: ['#32de84', '#ff004f']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        }
    )
}

SetupCharts()