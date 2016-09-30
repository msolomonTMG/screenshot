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

function addScreenShotToIssue(issue, screenshotBlob) {
  return new Promise(function (resolve, reject) {
    let data = new FormData();
    data.append('file', screenshotBlob, 'capture.jpeg');

    let request = {
      method: 'post',
      url: issue.self + '/attachments',
      headers: [
        {
          key: 'X-Atlassian-Token',
          value: 'nocheck'
        }
      ],
      data: data,
      contentType: false,
      cache: false,
      processData: false
    }

    sendAjaxRequest(request)
      .then(response => {
        return resolve(response);
      })
      .catch(err => {
        return reject(err);
      })
  })
}

function saveScreenshotToDisk() {
  return new Promise(function(resolve, reject) {
    getScreenshot().then(screenshot => {
      window.webkitRequestFileSystem(window.TEMPORARY, 5*1024*1024, function (fs) {
        let file_system = fs;
        file_system.root.getFile('capture.jpeg', {create: true}, function(fileEntry) {
          fileEntry.createWriter(function(fileWriter) {
            fileWriter.onwriteend = function(e) {
              console.log("Write successfully")
            };
            fileWriter.onerror = function(e) {
              console.log("Write error!")
            };
            let content = base64ToBinary(screenshot);
            let blob = new Blob([content]);
            fileWriter.write(blob);

            return resolve(blob);
          });
        });
      });
    });
  });

  function base64ToBinary(imgUrl) {
    var BASE64_MARKER = ';base64,';
    var base64Index = imgUrl.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
    var base64 = imgUrl.substring(base64Index);
    var raw = window.atob(base64);
    var rawLength = raw.length;
    var array = new Uint8Array(new ArrayBuffer(rawLength));

    for (var i = 0; i < rawLength; ++i) {
      array[i] = raw.charCodeAt(i);
    }
    return array;
  }

}

function getScreenshot() {
  return new Promise(function (resolve, reject) {
    chrome.storage.local.get('screenshotURL', function (data) {
      if (!chrome.runtime.error) {
        resolve(data.screenshotURL)
      } else {
        reject(data)
      }
    });
  })
}

function getAdditionalIssueInfo(issue) {
  return new Promise(function (resolve, reject) {
    let request = {
      method: 'get',
      url: issue.self
    }
    sendAjaxRequest(request)
      .then(additionalIssueInfo => {
        return resolve(additionalIssueInfo);
      })
      .catch(err => {
        return reject(err);
      })
  })
}

function createIssue() {
  return new Promise(function (resolve, reject) {
    let issueData = getIssueData(); // the summary, description, and screenshot created by the user
    let jiraUrl    = getJiraUrl();  // the jira url for the user's atlassian instance

    // once we have everything we need to create the ticket, send the POST to JIRA
    Promise.all([issueData, jiraUrl]).then(values => {
      console.log(values);
      let request = {
        method: 'post',
        data: JSON.stringify(values[0]),
        url: values[1],
        contentType: 'application/json; charset=utf-8'
      };
      resolve({
        id: "49212",
        key: "TR-3361",
        self:"https://thrillistmediagroup.atlassian.net/rest/api/2/issue/49212"
      });
      //TODO: uncomment this to actually create tickets
      // sendAjaxRequest(request)
      //   .then(response => {
      //     return resolve(response);
      //   })
      //   .catch(error => {
      //     return reject(error);
      //   })
    });
  })

  function getIssueData() {
    return new Promise(function(resolve, reject) {
      chrome.storage.local.get({
        'issueSummary': '',
        'issueDescription': '',
        'projectKey': '',
        'issueType': ''
      }, function(items) {
        console.log('issue data', items);
        if (!chrome.runtime.error) {
          let issueData = {
            'fields': {
              'project': {
                'key': items.projectKey
              },
              'summary': items.issueSummary,
              'description': items.issueDescription,
              'issuetype': {
                'name': items.issueType
              }
            }
      		};
          return resolve(issueData);
        } else {
          return reject(items);
        }
      });
    });
  }

  function getJiraUrl() {
    return new Promise(function(resolve, reject) {
      resolve('https://thrillistmediagroup.atlassian.net/rest/api/2/issue');
      //TODO: set this up properly with an options page
      // chrome.storage.sync.get({
      //   'jiraURl': ''
      // }, function(items) {
      //   if (!chrome.runtime.error) {
      //     return resolve(items);
      //   } else {
      //     return reject(items);
      //   }
      // })
    })
  }
}

// takes a screenshot and saves the URL to local storage
function takeScreenshot() {
  return new Promise (function(resolve, reject) {
    // take the screenshot
    chrome.tabs.captureVisibleTab(function (imgUrl) {
      // save the screenshot url to chrome storage
      chrome.storage.local.set({'screenshotURL': imgUrl}, function() {
        return resolve(imgUrl);
      });
    });
  });
}

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

function sendChromeNotification(issue) {
  createOptions().then(options => createNotification(options) );

  function createOptions() {
    return new Promise(function (resolve, reject) {
      resolve({
        type: 'list',
        title: issue.key + ' has been created!',
        message: 'obligatory message that is not displayed in the list notification template',
        items: [
          {
            title: "Summary",
            message: issue.fields.summary
          },
          {
            title: "Description",
            message: issue.fields.description
          }
        ],
        iconUrl: 'icons/icon-128.png',
        buttons: [
          {
            title: 'Go to issue',
            iconUrl: 'icons/arrow-right.png'
          }
        ]
      })
    })
  }

  function createNotification(options) {
    chrome.notifications.create('notification', options, function(notificationId) {
      chrome.notifications.onClicked.addListener(notificationListener);

      function notificationListener(notificationId) {
        if (notificationId == 'notification') {
          //TODO: make this the url of the ticket
          goTo(issue.self);
          clearNotification(notificationId)
            .then(wasCleared => {
              chrome.notifications.onClicked.removeListener(notificationListener); // prevent tabs opening twice
            })
            .catch(wasCleared => {
              console.log('did not clear notification');
            })
        }
      }
    });
  }

  function clearNotification(notificationId) {
    return new Promise (function(resolve, reject) {
      chrome.notifications.clear(notificationId, function(wasCleared) {
        if (wasCleared) {
          return resolve(wasCleared);
        } else {
          return reject(wasCleared);
        }
      })
    })
  }
}
