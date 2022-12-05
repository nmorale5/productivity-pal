async function SetupPrompt() {
    let { history, productive } = await chrome.storage.local.get(["history", "productive"])
    await DisplayChecklist(history, productive)
    await ConfigureButtonClick(productive)
}

async function DisplayChecklist(history, productive) {
    let ids = ['good-websites', 'bad-websites', 'new-websites']
    let vals = [true, false, undefined]
    let seenUrls = {}
    console.log(vals)
    for (let val of vals) {
        console.log(val)
        idName = ids[vals.indexOf(val)]
        let header = document.getElementById(idName)
        console.log(idName)
        for (let urlData of history.slice().reverse()) {
            if (urlData.url === null) continue  // skip inactive
            if (seenUrls[urlData.url]) continue // avoid duplicate checkboxes
            if (productive[urlData.url] !== val) continue // does all true first, then all false, then all undefined

            seenUrls[urlData.url] = true

            let checkbox = document.createElement('input')
            checkbox.setAttribute("type", "checkbox")
            checkbox.setAttribute("id", urlData.url)
            header.appendChild(checkbox)

            let label = document.createElement('label')
            label.setAttribute('for', urlData.url)
            label.innerText = urlData.title + '\n'
            header.appendChild(label)

            checkbox.checked = val === true  // changes undefined to false
            productive[urlData.url] = checkbox.checked
    
            checkbox.addEventListener('click', () => {
                productive[urlData.url] = !productive[urlData.url]
            })
        }
    }
}

// async function UpdateProductivityData(productive) {
//     await chrome.storage.local.set({ productive })
// }

async function ConfigureButtonClick(productive) {
    let button = document.getElementById('continue')
    button.addEventListener('click', async function() {
        await chrome.storage.local.set({ productive })
        window.location.replace('./data.html')
    })
}

SetupPrompt()