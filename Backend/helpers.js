async function getCurrentTabId() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab.id;
}

async function createTree(name) {
  let tabId = await getCurrentTabId();
  let newTree = {};
  newTree[tabId.toString()] = { parent: null, children: [] };
  await chrome.storage.local.set({
    [name]: newTree,
    currentTreeName: name,
    currentTabId: tabId,
    rootTabId: tabId,
  });
}

async function getTree(name) {
  await chrome.storage.local.set({ currentTreeName: name });
  return await chrome.storage.local.get(name);
}
