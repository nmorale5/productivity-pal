async function initialize() {
  await chrome.storage.local.clear()
  await setupData()
  console.log("started up!")
}

async function setupData() {
  await chrome.storage.local.set({
    history: [], // interlaced list of timestamps and url data
  })
}

chrome.runtime.onInstalled.addListener(initialize)
chrome.runtime.onStartup.addListener(initialize)
chrome.tabs.onUpdated.addListener(onNavigatedNewLink)
chrome.tabs.onActivated.addListener(onChangedTab)
chrome.windows.onFocusChanged.addListener(onChangedWindow)