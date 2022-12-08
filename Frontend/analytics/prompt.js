async function SetupPrompt() {
    let { history, productive, viewing, sessions } = await chrome.storage.local.get(["history", "productive", "viewing", "sessions"])
    if (sessions[viewing]) {
        history = sessions[viewing].history
    }
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
			if (urlData.url == '' || urlData.title == "Sites Visited" || urlData.title == "Your Analytics") continue //always consider analytic pages inactive, don't display

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

async function ConfigureButtonClick(newProductive) {
    let button = document.getElementById('continue')
    button.addEventListener('click', async function() {
        // pull first before overriding
        let { productive } = await chrome.storage.local.get("productive")
        for (let url of Object.keys(newProductive)) {
            productive[url] = newProductive[url]
        }
        await chrome.storage.local.set({ productive })
        window.location.replace('./data.html')
    })
}

SetupPrompt()