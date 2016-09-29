// redirects user to a new page (passed as a parameter) in a new tab
function goTo(page) {
  let currentTabIndex = new Promise(function(resolve, reject) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      resolve(tabs[0].index);
    });
  });
  currentTabIndex.then(function(index) {
    // create a new tab to view the images
    chrome.tabs.create({
      'url': page,
      'active': true,
      'index': index + 1
    });
  });
}
