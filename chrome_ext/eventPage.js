'use strict';

const screenshotEditor = '/pages/screenshotEditor.html';

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch(request.action) {
    case 'take_screenshot':
      screenshot.takeScreenshot().then( tab.goTo(screenshotEditor) );
      break;
    case 'create_issue':
      jira.createIssue().then(issue => {
        screenshot.saveScreenshotToDisk().then(screenshotBlob => {
          jira.addScreenShotToIssue(issue, screenshotBlob).then(data => {
            jira.getAdditionalIssueInfo(issue).then(additonalIssueInfo => {
              notification.sendChromeNotification(additonalIssueInfo);
            })
          })
        })
      });
      break;
    case 'send_ajax_reuest':
      sendAjaxRequest(request.ajaxRequest)
        .then(response => {
          sendResponse(response);
        })
        .catch(err => {
          console.log(err);
          sendResponse(err);
        });
      return true;
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
        return resolve(data);
      },
      error: function(xhr){
        return reject(xhr);
      }
    });
  })
}

// open the options page on install
chrome.runtime.onInstalled.addListener(function (onInstalled) {
    if (onInstalled.reason === 'install') {
      chrome.tabs.create({url: 'chrome://extensions/?options=' + chrome.runtime.id});
    }
});
