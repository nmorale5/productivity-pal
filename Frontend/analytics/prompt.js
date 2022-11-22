async function SetupPrompt() {
    let { allData } = await chrome.storage.local.get("allData")
    await DisplayChecklist(allData)
    await ConfigureButtonClick(allData)
}

async function DisplayChecklist(allData) {
    let ids = ['good-websites', 'bad-websites', 'new-websites']
    let vals = [true, false, undefined]
    console.log(vals)
    for (let val of vals) {
        console.log(val)
        idName = ids[vals.indexOf(val)]
        let header = document.getElementById(idName)
        console.log(idName)
        for (let url of Object.keys(allData)) {
            if (allData[url].productive !== val) continue;

            let checkbox = document.createElement('input')
            checkbox.setAttribute("type", "checkbox")
            checkbox.setAttribute("id", url)
            header.appendChild(checkbox)
    
            let label = document.createElement('label')
            label.setAttribute('for', url)
            label.innerText = allData[url].title + '\n'
            header.appendChild(label)
    
            checkbox.checked = val === true
            allData[url].productive = val === true
    
            checkbox.addEventListener('click', () => {
                allData[url].productive = !allData[url].productive
            })
        }
    }
}

async function UpdateProductivityData(newData) {
    let { allData } = await chrome.storage.local.get("allData")
    for (let url of Object.keys(newData)) {
        allData[url].productive = newData[url].productive
    }
    await chrome.storage.local.set({ allData })
}

async function ConfigureButtonClick(allData) {
    let button = document.getElementById('continue')
    button.addEventListener('click', async function() {
        await UpdateProductivityData(allData)
        window.location.replace('./data.html')
    })
}

SetupPrompt()