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
