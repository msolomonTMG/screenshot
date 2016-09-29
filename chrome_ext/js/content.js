"use strict";

let apolloData = {};
const eventPagePort = chrome.runtime.connect({name: "event_page_port"});

eventPagePort.onMessage.addListener(function(request) {
  if (request.action == 'deliver_prerequisite_status' && request.all_variables_are_known == true) {
    apolloData = request.variables;
    //checkCurrentBuilds();
    populateDropdown(initiateButtonState);
  } else if (request.action == 'deliver_updated_variable') {
    apolloData = request.variables;
  }
});
