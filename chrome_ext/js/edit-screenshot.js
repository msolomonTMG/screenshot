chrome.storage.local.get('screenshotURL', function (data) {
  if (!chrome.runtime.error) {
    $('#screenshot').attr('src', data.screenshotURL);
  }
});

$(document).ready(function() {
  $('.create-issue').on('click', function() {
    saveIssueData().then( createIssue() );
    chrome.tabs.getCurrent(function(tab) {
      chrome.tabs.remove(tab.id, function() { });
    });
  })

  // clear description when cancel button or x is clicked
  $('.cancel-description').on('click', function () {
    $('#description-form').trigger('reset');
  })
})

function saveIssueData() {
  return new Promise(function(resolve, reject) {
    //TODO: all of this data should be set by the user

    let issueSummary = $('.issue-summary').val();
    let issueDescription = $('.issue-description').val();

    chrome.storage.local.get('pageUrl', function(items) {
      let url = items.pageUrl;
      let urlDescription = '\n *Taken From:* ' + url;

      chrome.storage.local.set({
        'projectKey': 'TR',
        'issueSummary': issueSummary,
        'issueDescription': issueDescription + urlDescription,
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
