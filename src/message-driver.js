import Rx from 'rx';

export function makeMessageDriver() {
  let event$$ = new Rx.Subject()

  function sendMessage(message) {
    if(!message) return;
    chrome.runtime.sendMessage(message, response => {
      if (response) {
        event$$.onNext(response);
      }
    });
  }

  function get(kind) {
    return event$$.filter(event => event && event.kind === kind)
  }

  return function messageDriver(message$) {
    message$.subscribe(sendMessage);

    return { get }
  }
}
