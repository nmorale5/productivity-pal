async function initialize() {
  await chrome.storage.local.clear()
  await setupData()
  console.log("started up!")
}

async function setupData() {
  await chrome.storage.local.set({
    history: [], // list of objects with url, title, & time (timestamp)
    productive: {}, // object mapping urls to booleans
  })
}

chrome.runtime.onInstalled.addListener(initialize)
chrome.runtime.onStartup.addListener(initialize)
chrome.tabs.onUpdated.addListener(onNavigatedNewLink)
chrome.tabs.onActivated.addListener(onChangedTab)
chrome.windows.onFocusChanged.addListener(onChangedWindow)