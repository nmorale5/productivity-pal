async function setupData() {
    await chrome.storage.local.set({
        allData: {},
        lastTime: Date.now()
    })
}

async function onClickedNewLink(tabId, changeInfo, tab) {
    let url = changeInfo.url
    await addNewUrlData(url)
}

async function onChangedTab(activeInfo) {
    let tabId = activeInfo.tabId
    let tabInfo = await chrome.tabs.get(tabId)
    let url = tabInfo.url
    await addNewUrlData(url)
}

async function addNewUrlData(url) {
    if (!url) return
    let { allData } = await chrome.storage.local.get("allData")
    let { lastTime } = await chrome.storage.local.get("lastTime")
    let currentTime = Date.now()
    timeDiff = currentTime - lastTime
    if (!allData[url]) allData[url] = 0
    allData[url] += timeDiff / 1000 // convert ms to s
    await chrome.storage.local.set({ allData: allData, lastTime: currentTime })
}
