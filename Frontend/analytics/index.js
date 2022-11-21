import { Chart } from '../../node_modules/chart.js/auto/auto.js'

async function retrieveData() {
    let { allData } = await chrome.storage.local.get("allData")
    for (let url of Object.entries(allData)) {
        console.log(url, allData[url])
    }
}

async function displayChart() {
  const data = [
    { year: 2010, count: 10 },
    { year: 2011, count: 20 },
    { year: 2012, count: 15 },
    { year: 2013, count: 25 },
    { year: 2014, count: 22 },
    { year: 2015, count: 30 },
    { year: 2016, count: 28 },
  ];

  new Chart(
    document.getElementById('chart'),
    {
      type: 'bar',
      data: {
        labels: data.map(row => row.year),
        datasets: [
          {
            label: 'Acquisitions by year',
            data: data.map(row => row.count)
          }
        ]
      }
    }
  );
}

retrieveData()
displayChart()