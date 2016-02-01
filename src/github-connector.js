import Rx from 'rx';
import {div, p, a} from '@cycle/dom';
import C from 'constants';
import M from 'messages';

let {Observable} = Rx;

function GitHubConnector(sources) {
  const intent = (DOM) => {
    return {
      login$: DOM
        .select('#github-login')
        .events('click')
        .map(ev => true),
      logout$: DOM
        .select('#github-logout')
        .events('click')
        .map(ev => true),
    }
  }

  const model = (message, actions) => {
    const logout$ = actions.logout$
          .map((ev) => {
            if (!ev) return;
            return {kind: M.GITHUB_LOGOUT};
          })

    const login$ = actions.login$
          .startWith(false)
          .map((ev) => {
            if (!ev) return;
            return {kind: M.GITHUB_LOGIN};
          })
    return {
      message: logout$.merge(login$).startWith({kind: M.GITHUB_STATE}),
    }
  }

  const loggedInView = () => {
    return div({className: 'panel', id: 'github-loggedin'}, [
      p("You are already authorized. If something doesn't work, try logging out using the button below, and logging back in."),
      a({className: 'medium success button', id: 'github-logout'},
        'Log out'),
    ])
  }

  const loggedOutView = () => {
    return div({className: 'panel', id: 'github-loggedout'}, [
      p("To get going, you'll need to authorize the extension to use your GitHub account."),
      p("Do it by clicking the big Authorize button below."),
      a({className: 'medium success button', id: 'github-login'},
        'Authorize'),
    ])
  }

  const view = (message, state) => {
    return message.get(M.GITHUB_STATE)
      .map(state => {
        if (state.authorized) {
          return loggedInView()
        } else {
          return loggedOutView()
        }
      })
  }

  let intent$ = intent(sources.DOM);
  let model$ = model(sources.message, intent$);
  let view$ = view(sources.message, model$);

  return {
    DOM: view$,
    message: model$.message,
  }
}

export default GitHubConnector;
