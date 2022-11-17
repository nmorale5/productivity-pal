async function retrieveData() {
    let { allData } = await chrome.storage.local.get("allData")
    for (url of Object.entries(allData)) {
        console.log(url, allData[url])
    }
}

retrieveData()