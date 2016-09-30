var tabHelpers = {
  getCurrentTabIndex: function () {
    return new Promise(function(resolve, reject) {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
          return resolve(tabs[0].index);
        } else {
          return reject(tabs);
        }
      });
    });
  },
  createNewTab: function (page, index) {
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
}

var tab = {
  // creates a new tab and makes it the current tab
  goTo: function (page) {
    return new Promise (function(resolve, reject) {
      tabHelpers.getCurrentTabIndex()
        .then(function (index) {
          tabHelpers.createNewTab(page, index)
            .then(function(tab) {
              return resolve(tab);
            })
        })
    })
  }
}
