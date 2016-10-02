/*
  TODO:
  1- This is not handling bad credentials properly
  2- Took this code from an old extension. Could use some clean up
*/

// Saves options to chrome.storage
function save_options() {
  clearMsg();
  var username = document.getElementById('username').value;
  var password = document.getElementById('password').value;
  var url      = document.getElementById('url').value;

  // a trailing slash in the url will mess up the extension -- remove it if it exists
  url = stripTrailingSlash(url);

  var credentials = username + ":" + password;
  credentials = btoa(credentials);

  chrome.storage.sync.set({
    jira_user: username,
    jira_password: password,
    jira_url: url
  }, function() {
      // after we save the info, send a GET to JIRA and let's check if
      // a) the credentials work
      // b) the project exists
      chrome.runtime.sendMessage(
        {
          action: 'send_ajax_reuest',
          ajaxRequest: {
            url: url + '/rest/api/2/user',
            data: {
              username: username
            },
            headers: [
              {
                key: 'Authorization',
                value: 'Basic ' + credentials
              }
            ]
          }
        },
        function(response) {
          console.log(response);
          if (chrome.runtime.lastError) {
            // An error occurred :(
            console.log("ERROR: ", chrome.runtime.lastError);
          } else if (response.status === 401 || response.status === 404 || response.status === 500) {
            console.log(response);
            document.getElementById('errorMsg').className = "alert alert-danger fade-in";
          } else {
            // Show message to let user know options were saved.
            document.getElementById('successMsg').className = "alert alert-success fade-in";

            var avatar = response.avatarUrls['48x48'];
            // save the user's avatar
            chrome.storage.sync.set({
              jira_avatar: avatar
            });
          }
        }
      );
      if (isMessageDisplayed === false) {
        document.getElementById('errorMsg').className = "alert alert-danger fade-in";
      }
  });
}

function stripTrailingSlash(str) {
    if(str.substr(-1) === '/') {
        return str.substr(0, str.length - 1);
    }
    return str;
}

function isMessageDisplayed() {
  var successMsg = document.getElementById('successMsg');
  var errorMsg   = document.getElementById('errorMsg');
  if (successMsg.classList.contains('hidden') && warningMsg.classList.contains('hidden') && errorMsg.classList.contains('hidden')){
    return false
  }
  else {
    return true;
  }
}

function clearMsg() {
  document.getElementById('successMsg').className = "alert alert-success hidden";
  document.getElementById('errorMsg').className   = "alert alert-warning hidden";
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Set default values
  chrome.storage.sync.get({
    jira_user: 'unknown',
    jira_password: 'unknown',
    jira_url: 'unknown'
  }, function(items) {
    var username = items.jira_user;
    var password = items.jira_password;
    var url      = items.jira_url;

    if (username != 'unknown') {
      document.getElementById('username').value = username;
    }
    if (password != 'unknown') {
      document.getElementById('password').value = password;
    }
    if (url != 'unknown') {
      document.getElementById('url').value = url;
    }
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('save').addEventListener('kepress', function(e) {
  if (e.keyCode === 13) {
    save_options();
  }
})
