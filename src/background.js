import C from 'constants';
import M from 'messages';
import * as GitHubOAuth from 'github-oauth';
import GitHubClient from 'github-client';

const githubParams = {
  'clientId': 'b5a70bd8168d50346752',
  'clientSecret': '3793c48f7b1a8056a19272e687c9e669df9fafe0',
  'scope': 'repo',
};

chrome.runtime.onMessage.addListener(handleMessage);

function handleMessage(request, sender, sendResponse) {
  const handler = messageHandlers[request.kind];
  if (handler) {
    handler(request, sender, sendResponse);
  }
}

const messageHandlers = {};
messageHandlers[M.GITHUB_LOGIN] = (request, sender, sendResponse) => {
  GitHubOAuth.getToken(true, githubParams, function(error, token) {
    GitHubClient.setToken(token);
    sendGithubState(error, sendResponse);
  })
}
messageHandlers[M.GITHUB_LOGOUT] = (request, sender, sendResponse) => {
  GitHubOAuth.removeCachedToken(githubAccessToken);
  GitHubClient.setToken(null);
  sendGithubState(null, sendResponse);
}
messageHandlers[M.GITHUB_STATE] = (request, sender, sendResponse) => {
  sendGithubState(null, sendResponse);
}

function sendGithubState(error, sendResponse) {
  let message = {
    kind: M.GITHUB_STATE,
    authorized: GitHubClient.hasCredentials(),
    error: error,
  };
  if (message.authorized) {
  }
  sendResponse(message);
}

function isAuthorized() {
  !!(localStorage.trello_token && GitHubClient.hasCredentials());
}

function createUnauthorizedMenu() {
  chrome.contextMenus.create({
    "id": "root",
    "title": "Authorize Trello and GitHub",
    "contexts": ["page"],
    "onclick": function(info, tab) { console.log(info, tab); }
  });
}

function createAuthorizedMenu() {
  chrome.contextMenus.create({
    "id": "root",
    "title": "Create GitHub Issue",
    "contexts": ["page"],
    "onclick": function(info, tab) { console.log(info, tab); }
  });
}

export function init() {
  if (isAuthorized()) {
    createAuthorizedMenu();
  } else {
    createUnauthorizedMenu();
  }
}
