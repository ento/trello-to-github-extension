import Rx from 'rx';
import Cycle from '@cycle/core';
import {div, h1, makeDOMDriver} from '@cycle/dom';
import TrelloConnector from 'trello-connector';
import GitHubConnector from 'github-connector';
import {makeMessageDriver} from 'message-driver';
import C from 'constants';

let {Observable} = Rx;

// APP
function Header() {
  return {
    DOM: Observable.return(
      div({className: 'row'}, [
        div({className: 'large-12 columns'}, [
          h1('Trello to GitHub Settings')
        ])
      ])
    )
  };
}

function Footer() {
  return {
    DOM: Observable.return(
      div("=== footer ===")
    )
  };
}

function main(sources) {
  const intent = ({DOM}) => {
    return {
    };
  }

  const model = (actions) => {
    return {
    };
  }

  const view = (state) => {
    return {
      DOM: Observable.combineLatest(
        Header().DOM, TrelloConnector(sources).DOM, githubConnector.DOM, Footer().DOM,
        function (header, trello, github, footer) {
          return div([
            header,
            trello,
            github,
            footer,
          ]);
        }),
    };
  }

  let githubConnector = GitHubConnector(sources);
  let view$ = view(model(intent(sources)));

  return {
    DOM: view$.DOM,
    message: githubConnector.message,
  };
}

function init() {
  // Check if page load is a redirect back from the auth procedure
  if (HashSearch.keyExists('token')) {
    Trello.authorize(
      {
        name: C.APP_NAME,
        expiration: "never",
        interactive: false,
        scope: {read: true, write: false},
        success: function () {},
        error: function () {
          alert("Failed to authorize with Trello.")
        }
      });
  }
}

module.exports = {
  init: init,
  run: function() {
    Cycle.run(main, {
      DOM: makeDOMDriver("#app"),
      message: makeMessageDriver(),
    });
  }
}
