async function initialize() {
  await chrome.storage.local.clear()
  await setupData()
  console.log("started up!")
}

async function setupData() {
  await chrome.storage.local.set({
    history: [], // list of objects with url, title, & time (timestamp)
    productive: {}, // object mapping urls to booleans
    inactive: false, // whether the user is currently read as inactive
    sessions: [], // all previous sessions {history, name}
    viewing: null, // the session number to load to the dashboard (null if current)
  })
}

chrome.runtime.onInstalled.addListener(initialize)
chrome.runtime.onStartup.addListener(initialize)
chrome.tabs.onUpdated.addListener(onNavigatedNewLink)
chrome.tabs.onActivated.addListener(onChangedTab)
chrome.windows.onFocusChanged.addListener(onChangedWindow)
// setInterval(checkInactive, 1000) // ping every second (might drain battery lol)