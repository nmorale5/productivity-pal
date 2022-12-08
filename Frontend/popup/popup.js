function SetupPopup() {
    ConfigureButtons()
}

// returns true iff history contains at least 2 "real" urls
function checkLength(history) {
    let sites = history.filter((urlData) => {
        return !['', "Sites Visited", "Your Analytics", null, undefined].includes(urlData.title)
    })
    console.log(sites)
    return sites.length >= 2
}

function displayWarning() {
    let warning = document.getElementById("warning")
    warning.style.display = "block" // "block" is just the name meaning visible
}

async function ConfigureButtons() {
    // let viewAnalytics = document.getElementById("view-analytics")
    // viewAnalytics.onclick = () => {
    //     window.open("../analytics/prompt.html", "_blank")
    // }

    let startNew = document.getElementById("start-new")
    startNew.onclick = async function() {
        let { history, sessions } = await chrome.storage.local.get(["history", "sessions"])
        if (!checkLength(history)) return displayWarning()
        sessions.push({
            history: history,
            name: "Session " + (sessions.length + 1),
        })
        await chrome.storage.local.set({ sessions: sessions, history: [] })
        location.reload()
        console.log("reset storage. Current sessions is: ")
        console.log(sessions)
    }

    let allSessions = document.getElementById("sessions")
    let { sessions } = await chrome.storage.local.get("sessions")

    for (let i=0; i<sessions.length; i++) {
        let bullet = document.createElement("li")
        bullet.innerText = sessions[i].name
        bullet.onclick = async function() {
            await chrome.storage.local.set({ viewing: i })
            window.open("../analytics/prompt.html", "_blank")
        }
        bullet.onmouseover = () => {
            bullet.style.cursor = "pointer"
        }
        allSessions.appendChild(bullet)
    }

    let bullet = document.createElement("li")
    bullet.innerText = "Current (" + (sessions.length + 1) + ")"
    bullet.style.fontWeight = 'bold'
    bullet.onclick = async function() {
        let { history } = await chrome.storage.local.get("history")
        if (checkLength(history)) {
            await chrome.storage.local.set({ viewing: null })
            window.open("../analytics/prompt.html", "_blank")
        }
        else {
            displayWarning()
        }
    }
    bullet.onmouseover = async function() {
        let { history } = await chrome.storage.local.get("history")
        if (checkLength(history)) bullet.style.cursor = "pointer"
    }
    allSessions.appendChild(bullet)
}

SetupPopup()