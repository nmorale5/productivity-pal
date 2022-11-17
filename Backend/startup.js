async function initialize() {
  await chrome.storage.local.clear()
  await setupData()
  console.log("started up!")
}

chrome.runtime.onInstalled.addListener(initialize)
chrome.runtime.onStartup.addListener(initialize)
chrome.tabs.onUpdated.addListener(onClickedNewLink)
chrome.tabs.onActivated.addListener(onChangedTab)