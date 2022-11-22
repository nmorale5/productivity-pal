import { Chart } from '../../node_modules/chart.js/auto/auto.js'

async function SetupCharts() {
    let { allData } = await chrome.storage.local.get("allData")
    let pieData = GetPieChartData(allData)
    DisplayPieChart(pieData)
}

function GetPieChartData(allData) {
    let prodTime = 0
    let unprodTime = 0
    for (let url of Object.keys(allData)) {
        if (allData[url].productive === true) {
            prodTime += allData[url].time
        } if (allData[url].productive === false) {
            unprodTime += allData[url].time
        } // ignore if productive is undefined
    }
    return [prodTime, unprodTime]
}

function DisplayPieChart(pieData) {
    new Chart(
        document.getElementById('pie-chart'),
        {
            type: 'doughnut',
            data: {
                labels: ['Productive', 'Unproductive'],
                datasets: [{
                    label: "Time Spent",
                    data: pieData,
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