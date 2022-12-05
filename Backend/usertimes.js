async function onNavigatedNewLink(tabId, changeInfo, tabInfo) {
    console.log(changeInfo)
    if (!changeInfo.title || !tabInfo.url) return
    await addNewUrlData(tabInfo.url, changeInfo.title)
}

async function onChangedTab(activeInfo) {
    console.log("tab changed!")
    let tabId = activeInfo.tabId
    let tabInfo = await chrome.tabs.get(tabId)
    if (!tabInfo.title || !tabInfo.url) return
    await addNewUrlData(tabInfo.url, tabInfo.title)
}

async function onChangedWindow(windowId) {
    console.log("window changed to " + windowId)
    if (windowId == chrome.windows.WINDOW_ID_NONE) {
        return await addNewUrlData(null, null) // used to represent inactivity
    }
    [tab] = await chrome.tabs.query({windowId: windowId, active: true})
    console.log(tab)
    await addNewUrlData(tab.url, tab.title)
}

async function addNewUrlData(url, title) {
    let { history } = await chrome.storage.local.get("history")
    history.push({ 
        url: url,
        title: title,
        time: Date.now(),
    })
    console.log(history)
    await chrome.storage.local.set({ history })
}

// async function addNewUrlData(url, title) {
//     if (!url) return
//     let currentTime = Date.now()
//     let { allData, lastTime, lastUrl, lastTitle } = await chrome.storage.local.get(["allData", "lastTime", "lastUrl", "lastTitle"])
//     await chrome.storage.local.set({ lastTime: currentTime, lastUrl: url, lastTitle: title })
//     if (!lastUrl) return
//     let timeDiff = currentTime - lastTime
//     if (!allData[lastUrl]) allData[lastUrl] = { time: 0 }
//     allData[lastUrl].time += timeDiff / 1000 // convert ms to s
//     allData[lastUrl].title = lastTitle
//     console.log(lastTitle, timeDiff)
//     await chrome.storage.local.set({ allData })
// }
