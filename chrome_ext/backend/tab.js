// creates a new tab and makes it the current tab
function goTo(page) {
  return new Promise (function(resolve, reject) {
    getCurrentTabIndex()
      .then(function (index) {
        createNewTab(page, index)
          .then(function(tab) {
            return resolve(tab);
          })
      })
  })
}

function getCurrentTabIndex() {
  return new Promise(function(resolve, reject) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        return resolve(tabs[0].index);
      } else {
        return reject(tabs);
      }
    });
  });
}

function createNewTab(page, index) {
  return new Promise(function(resolve, reject) {
    chrome.tabs.create({
      'url': page,
      'active': true,
      'index': index + 1
    }, function (tab) {
      // if tab has an id, we did good
      if (tab.id) {
        return resolve(tab);
      } else {
        return reject(tab);
      }
    });
  })
}
