// add listeners to the buttons once the document is ready
$(document).ready(function() {
  $('.take-screenshot').on('click', function(e) {
    e.preventDefault();
    chrome.runtime.sendMessage({action: 'take_screenshot'});
  })
});
