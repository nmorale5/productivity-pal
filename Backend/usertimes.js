async function onNavigatedNewLink(tabId, changeInfo, tabInfo) {
    if (!changeInfo.title) return
    await addNewUrlData(tabInfo.url, changeInfo.title)
}

async function onChangedTab(activeInfo) {
    let tabId = activeInfo.tabId
    let tabInfo = await chrome.tabs.get(tabId)
    await addNewUrlData(tabInfo.url, tabInfo.title)
}

async function addNewUrlData(url, title) {
    if (!url) return
    let currentTime = Date.now()
    let { allData } = await chrome.storage.local.get("allData")
    let { lastTime } = await chrome.storage.local.get("lastTime")
    let { lastUrl } = await chrome.storage.local.get("lastUrl")
    let { lastTitle } = await chrome.storage.local.get("lastTitle")
    await chrome.storage.local.set({ lastTime: currentTime, lastUrl: url, lastTitle: title })
    if (!lastUrl) return
    let timeDiff = currentTime - lastTime
    if (!allData[lastUrl]) allData[lastUrl] = { time: 0 }
    allData[lastUrl].time += timeDiff / 1000 // convert ms to s
    allData[lastUrl].title = lastTitle
    console.log(lastTitle, timeDiff)
    await chrome.storage.local.set({ allData })
}
