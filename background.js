// Setup functionality for when download begins via SafeDownloader
chrome.contextMenus.create({
  id: "begin-download",
  title: "Securely download via MalSafe",
  contexts: ["link"]
});

chrome.contextMenus.onClicked.addListener(menuItemClicked);
function menuItemClicked(info, tab) {
  if(info != null && info.hasOwnProperty('menuItemId') && info.menuItemId === "begin-download" && info.hasOwnProperty('linkUrl')) {
    var downloadUrl = info.linkUrl;
    var downloading = chrome.downloads.download({
      url : downloadUrl,
      saveAs: false,
      conflictAction : 'uniquify'
    });
  }
}

// Setting triggers for when download begins (inside and outside extension)
chrome.downloads.onCreated.addListener(downloadBegan);
function downloadBegan(item) {
}

function downloadChanged(delta) {
  if (delta.state && delta.state.current === "complete") {
    chrome.browserAction.setIcon({path: "icons/popup_active.png"});
    chrome.browserAction.setBadgeText({text: "+1"});
 }
}

// Setting triggers for when download is opened by user
chrome.downloads.onChanged.addListener(downloadChanged);
