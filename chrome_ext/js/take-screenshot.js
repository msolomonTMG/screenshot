// add listeners to the buttons once the document is ready
$(document).ready(function() {
  $('.take-screenshot').on('click', function(e) {
    e.preventDefault();
    getPageUrl().then(url => {
      chrome.runtime.sendMessage({action: 'take_screenshot'});
    });

    function getPageUrl() {
      return new Promise(function(resolve, reject) {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tab) {
          chrome.storage.local.set({'pageUrl': tab[0].url}, function() {
            if (!chrome.runtime.error) {
              return resolve(tab[0].url)
            } else {
              return reject(tab)
            }
          });
        });
      })
    }


  })
});
