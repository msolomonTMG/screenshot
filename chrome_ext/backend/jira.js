var jiraHelpers = {
  getIssueData: function () {
    return new Promise(function(resolve, reject) {
      chrome.storage.local.get({
        'issueSummary': '',
        'issueDescription': '',
        'projectKey': '',
        'issueType': ''
      }, function(items) {
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
  },
  getJiraUrl: function () {
    return new Promise(function(resolve, reject) {
      chrome.storage.sync.get({
        'jira_url': ''
      }, function(items) {
        if (!chrome.runtime.error) {
          return resolve(items);
        } else {
          return reject(items);
        }
      })
    })
  }
}
var jira = {
  getAdditionalIssueInfo: function (issue) {
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
  },
  createIssue: function () {
    return new Promise(function (resolve, reject) {
      let issueData = jiraHelpers.getIssueData(); // the summary, description, and screenshot created by the user
      let jiraUrl    = jiraHelpers.getJiraUrl();  // the jira url for the user's atlassian instance

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
  },
  addScreenShotToIssue: function (issue, screenshotBlob) {
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
}
