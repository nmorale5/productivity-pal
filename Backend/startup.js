async function initialize() {
  await chrome.storage.local.clear()
  await setupData()
  console.log("started up!")
}

async function setupData() {
  await chrome.storage.local.set({
    allData: {},
    lastTime: Date.now(),
  })
}

chrome.runtime.onInstalled.addListener(initialize)
chrome.runtime.onStartup.addListener(initialize)
chrome.tabs.onUpdated.addListener(onNavigatedNewLink)
chrome.tabs.onActivated.addListener(onChangedTab)