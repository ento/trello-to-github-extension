import Rx from 'rx';
import {div, p, a} from '@cycle/dom';
import C from 'constants';

let {Observable} = Rx;

function TrelloConnector(sources) {
  const intent = (DOM) => {
    return {
      login$: DOM
        .select('#trello-login')
        .events('click')
        .map(ev => true),
      logout$: DOM
        .select('#trello-logout')
        .events('click')
        .map(ev => true),
    }
  }

  const model = (actions) => {
    const logout$ = actions.logout$
          .startWith(false)
          .map((ev) => {
            if (!ev) return;
            Trello.deauthorize();
            location.reload();
          })

    const login$ = actions.login$
          .startWith(false)
          .map((ev) => {
            if (!ev) return;
            Trello.setKey(C.TRELLO_KEY);
            Trello.authorize(
              {
                name: C.APP_NAME,
                type: "redirect",
                expiration: "never",
                interactive: true,
                scope: {read: true, write: false},
                success: function () {
                  // Can't do nothing, we've left the page
                },
                error: function () {
                  alert("Failed to authorize with Trello.")
                }
              });
          })
    return {logout$: logout$, login$: login$}
  }

  const loggedInView = () => {
    return div({className: 'panel', id: 'trello-loggedin'}, [
      p("You are already authorized. If something doesn't work, try logging out using the button below, and logging back in."),
      a({className: 'medium success button', id: 'trello-logout'},
        'Log out'),
    ])
  }

  const loggedOutView = () => {
    return div({className: 'panel', id: 'trello-loggedout'}, [
      p("To get going, you'll need to authorize the extension to use your Trello account."),
      p("Do it by clicking the big Authorize button below."),
      a({className: 'medium success button', id: 'trello-login'},
        'Authorize'),
    ])
  }

  const view = (state) => {
    return Observable.combineLatest(state.login$, state.logout$, () => {
      if (localStorage.trello_token) {
        return loggedInView()
      } else {
        return loggedOutView()
      }
    })
  }

  return {
    DOM: view(model(intent(sources.DOM))),
  }
}

export default TrelloConnector;
