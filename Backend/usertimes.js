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

async function checkInactive() {
    let window = await chrome.windows.get(chrome.windows.WINDOW_ID_CURRENT)
    let { inactive } = await chrome.storage.local.get("inactive")
    console.log(window)
    if (!window.focused) return
}
