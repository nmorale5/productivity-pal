import { Chart } from '../../node_modules/chart.js/auto/auto.js'

/**
 * Doughnut Chart: Displays percentage of time spent productive vs unproductive (ignoring inactivity?)
 * Scatter Chart: Displays timeline of productive vs unproductive sites visited
 * Pie Chart: Displays top 5 most commonly visited sites?
 */

async function SetupCharts() {
    let { history, productive, sessions, viewing } = await chrome.storage.local.get(["history", "productive", "sessions", "viewing"])
    let title = document.getElementById("title")
    if (viewing !== null) {
        history = sessions[viewing].history
        title.innerText = sessions[viewing].name + " Productivity"
    } else {
        title.innerText = "Current Session Productivity"
    }
    let doughnutData = GetDoughnutChartData(history, productive)
    DisplayDoughnutChart(doughnutData)
    let scatterData = GetScatterChartData(history, productive)
    DisplayScatterChart(scatterData)
	let outlierData = GetOutliers(history, productive)
	DisplayOutliers(outlierData)
	DisplayRankedList(history, productive)
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
                        text: 'Total Time Spent (%)',
                        font: {
                            size: 16
                        },
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
    for (let i=0; i<data.length-3; i++) { //skip last three to remove analytics pages
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
    return RemoveBlueEnds(out)
}

function findEarliest(prod, unprod) {
    return Math.min(...[prod, unprod].filter(bumps => bumps.length > 0).map(bumps => bumps[0][0].x))
}

function findLatest(prod, unprod) {
    return Math.max(...[prod, unprod].filter(bumps => bumps.length > 0).map(bumps => bumps[bumps.length-1][2].x))
}

// removes unnecessary inactive time at the start and end
function RemoveBlueEnds({ prod, unprod, inactive }) {
    let earliest = findEarliest(prod, unprod)
    let latest = findLatest(prod, unprod)
    console.log(earliest, latest)
    let newInactive = []
    for (let bump of inactive) {
        if (bump[0].x < earliest || bump[1].x > latest) continue
        newInactive.push(bump)
    }
    return [prod, unprod, newInactive]
}

function DisplayScatterChart(scatterData) {
    console.log(scatterData)
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
                        text: 'Productivity Over Time (minutes)',
                        font: {
                            size: 16
                        }
                    },
                },
            }
        }
    )
}

function GetOutliers(history, productive) {
    let totalTime = 0
	let count = 0
	
    for (let i = 0; i < history.length - 1; i++) {
        let deltaTime = (history[i+1].time - history[i].time) / 60_000
        totalTime += deltaTime
		count += 1
    }
	let average = totalTime / count
	
	let squaredError = 0
    for (let i = 0; i < history.length - 1; i++) {
        let deltaTime = (history[i+1].time - history[i].time) / 60_000
        squaredError += Math.pow(deltaTime - average, 2)
    }
	let sd = Math.sqrt(squaredError / (count - 1))
	
	let outliers = []
	for (let i = 0; i < history.length - 1; i++) {
		if (history[i].title == '' || history[i].title == "Sites Visited" || history[i].title == "Your Analytics") continue
        let deltaTime = (history[i+1].time - history[i].time) / 60_000
        if (deltaTime > average + 2*sd) {
			outliers.push(history[i].title)
		}
    }
	if (outliers.length < 1) {
		outliers.push("None")
	}
    return outliers
}

function DisplayOutliers(outlierData) {
	let list = document.getElementById("outliers")
	outlierData.forEach((item)=>{
		let li = document.createElement("li")
		li.innerText = item
		list.appendChild(li)
	})
}

function DisplayRankedList(history, productive) {
	let seenUrls = {}
	for (let i = 0; i < history.length - 1; i++) {
        let deltaTime = (history[i+1].time - history[i].time) / 60_000
		if (history[i].url in seenUrls) {
			seenUrls[history[i].url][1] += deltaTime
		} else {
			seenUrls[history[i].url] = [history[i].title, deltaTime]
		}
	}
	
    let prod = []
    let unprod = []
	for (let url of Object.keys(seenUrls)) {
		if (productive[url] === true) {
            prod.push(seenUrls[url])
        } if (productive[url] === false) {
            unprod.push(seenUrls[url])
        } // ignore if productive is undefined
    }

    let totalTime = 0;
    for (let [_, time] of prod) {
        totalTime += time
    }
    for (let [_, time] of unprod) {
        totalTime += time
    }
	
	prod.sort(function(first, second) {
		return second[1] - first[1]
	})
	unprod.sort(function(first, second) {
		return second[1] - first[1]
	})
	
	let prodList = document.getElementById("productive")
	prod.forEach((item)=>{
		let li = document.createElement("li")
        let percentage = Math.round(1000 * item[1] / totalTime) / 10
		li.innerText = "(" +  percentage + "%) " + item[0]
		prodList.appendChild(li)
	})
	
	let unprodList = document.getElementById("unproductive")
	unprod.forEach((item)=>{
		let li = document.createElement("li")
        let percentage = Math.round(1000 * item[1] / totalTime) / 10
		li.innerText = "(" +  percentage + "%) " + item[0]
		unprodList.appendChild(li)
	})
}


SetupCharts()