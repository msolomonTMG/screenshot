chrome.storage.local.get('screenshotURL', function (data) {
  if (!chrome.runtime.error) {
    $('#screenshot').attr('src', data.screenshotURL);
  }
});

$(document).ready(function() {
  $('.create-issue').on('click', function() {
    saveIssueData().then( createIssue() );
  })
})

function saveIssueData() {
  return new Promise(function(resolve, reject) {
    //TODO: all of this data should be set by the user
    chrome.storage.local.get('pageUrl', function(items) {
      let url = items.pageUrl;
      let urlDescription = '\n *Taken From:* ' + url;

      chrome.storage.local.set({
        'projectKey': 'TR',
        'issueSummary': 'Test Summary',
        'issueDescription': 'Test Description: ' + urlDescription,
        'issueType': 'Task'
      }, function() {
        if (!chrome.runtime.error) {
          return resolve();
        } else {
          return reject();
        }
      });
    });
  });
}

function createIssue() {
  chrome.runtime.sendMessage({action: 'create_issue'});
}
