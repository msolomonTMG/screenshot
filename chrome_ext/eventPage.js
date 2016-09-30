'use strict';

const screenshotEditor = '/pages/screenshotEditor.html';

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch(request.action) {
    case 'take_screenshot':
      takeScreenshot().then( goTo(screenshotEditor) );
      break;
    case 'create_issue':
      createIssue().then(issue => {
        saveScreenshotToDisk().then(screenshotBlob => {
          addScreenShotToIssue(issue, screenshotBlob).then(data => {
            getAdditionalIssueInfo(issue).then(additonalIssueInfo => {
              sendChromeNotification(additonalIssueInfo);
            })
          })
        })
      });
      break;
  }
});

function sendAjaxRequest(request) {
  return new Promise (function(resolve, reject) {
    $.ajax({
      async: true,
      type: request.method,
      contentType: request.contentType,
      processData: request.processData,
      url: request.url,
      data: request.data,
      cache: request.cache,
      beforeSend: function(xhr){
        if (request.headers) {
          request.headers.forEach(function(header) {
            xhr.setRequestHeader(header.key, header.value);
          })
        }
      },
      success: function(data, status, xhr) {
        console.log(data);
        console.log(status);
        return resolve(data);
      },
      error: function(xhr){
        console.log('error', xhr);
        return reject(xhr);
      }
    });
  })
}
