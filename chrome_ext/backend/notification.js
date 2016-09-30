
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
