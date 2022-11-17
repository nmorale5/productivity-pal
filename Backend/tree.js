async function updateTree(tab) {
  /**
   * Triggers every time the tree should be updated,
   * usually after each time a new tab is open
   */
  console.log("tab changed...");
  let { currentTreeName } = await chrome.storage.local.get("currentTreeName");
  if (!currentTreeName) return;
  let treeObject = await chrome.storage.local.get(currentTreeName);
  let localTree = treeObject[currentTreeName];
  let nextTabId = tab.tabId;
  let { currentTabId } = await chrome.storage.local.get("currentTabId");
  let currentNode = localTree[currentTabId.toString()];
  let nextNode = localTree[nextTabId.toString()];

  // if new tab is already in tree, just change currentTabId
  if (nextNode) {
    await chrome.storage.local.set({ currentTabId: nextTabId });
    return;
  }
  // else new tab not in tree, so add it
  nextNode = { parent: currentTabId, children: [] };
  localTree[nextTabId] = nextNode;
  currentNode.children.push(nextTabId);
  // save the updated tree to storage and change the currentTabId node
  await chrome.storage.local.set({
    [currentTreeName]: localTree,
    currentTabId: nextTabId,
  });
}

async function setupTree() {
  /**
   * Called at the start of each session with Chrome.
   * Saves the tree used from the last session, then creates a new tree.
   */
  await createTree("test");
  // save old tree under its name using getTree(currentTreeName)
}

chrome.tabs.onActivated.addListener(updateTree);
