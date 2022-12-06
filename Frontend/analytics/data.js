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
    let scatterData = GetScatterChartData(history, productive)
    DisplayScatterChart(scatterData)
}

function GetDoughnutChartData(history, productive) {
    let prodTime = 0
    let unprodTime = 0
    // skip last data point for now to make life easier
    for (let i = 0; i < history.length - 1; i++) {
        let deltaTime = (history[i+1].time - history[i].time) / 60_000
        if (productive[history[i].url] === true) {
            prodTime += deltaTime
        } if (productive[history[i].url] === false) {
            unprodTime += deltaTime
        } // ignore if productive is undefined
    }
    let totalTime = prodTime + unprodTime
    return [100 * prodTime / totalTime, 100 * unprodTime / totalTime]
}

function DisplayDoughnutChart(doughnutData) {
    new Chart(
        document.getElementById('doughnut-chart'), {
            type: 'doughnut',
            data: {
                labels: ['Productive', 'Unproductive'],
                datasets: [{
                    label: "Time Spent %",
                    data: doughnutData,
                    backgroundColor: ['#32de84', '#ff004f']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Totat time spent (%)'
                    },
                },
            }
        }
    )
}

// returns list of { time, type, value }, where time is timestamp,
// type is "prod", "unprod", or "inactive" and value is 1, -1, or 0
function GetScatterChartData(history, productive) {
    let startTime = history[0].time
    let vals = { prod: 1, unprod: -1, inactive: 0 }
    let data = []
    for (let { time, url } of history) {
        let prod = productive[url]
        let type = prod ? "prod" : ((prod === false) ? "unprod" : "inactive")
        data.push({ time: (time - startTime) / 60_000, type: type, value: vals[type] })
    }
    return FormatScatterPoints(data)
}

// takes in a list as above and converts to list of [prod, unprod, inactive] where each
// is a list of corresponding "bumps", each of which is a list of { x, y } points
function FormatScatterPoints(data) {
    let out = { prod: [], unprod: [], inactive: [] }
    let lastValue = 0
    for (let i=0; i<data.length-1; i++) {
        let bump = []
        // connect horizontal line to x-axis at start, if necessary
        if (data[i].value != lastValue && data[i].value != 0) {
            bump.push({ x: data[i].time, y: 0 })
        }
        // draw horizontal line: y=1 for prod, y=-1 for unprod, y=0 for inactive
        bump.push({ x: data[i].time, y: data[i].value })
        bump.push({ x: data[i+1].time, y: data[i].value })
        // connect horizontal line to x-axis at end, if necessary
        if (data[i].value != data[i+1].value && data[i].value != 0) {
            bump.push({ x: data[i+1].time, y: 0 })
        }
        out[data[i].type].push(bump)
        lastValue = data[i].value
    }
    return [out.prod, out.unprod, out.inactive]
}

function DisplayScatterChart(scatterData) {
    let colors = ['#32de84', '#ff004f', '#76abdf']
    let datasets = []
    for (let i=0; i<3; i++) {
        for (let bump of scatterData[i]) {
            datasets.push({
                showLine: true,
                pointRadius: 0,
                borderColor: colors[i],
                data: bump
            })
        }
    }

    new Chart(
        document.getElementById("scatter-chart"), {
            type: 'scatter',
            data: {
                datasets: datasets,
                labels: ["Time in minutes", "foo"]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        display: false,
                        max: 2,
                        min: -2,
                    },
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                    title: {
                        display: true,
                        text: 'Productivity over time (minutes)'
                    },
                },
            }
        }
    )
}

SetupCharts()