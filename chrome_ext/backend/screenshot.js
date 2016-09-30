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
