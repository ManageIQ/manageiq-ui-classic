import idleJs from 'idle-js';

let last_ping = new Date() / 1000;
let idle = null;

export default function miqKeepAlive() {
  if (! ManageIQ.login.timeout) {
    console.warning('Not initializing keepalive, no session timeout info.');
    return;
  }

  window.setInterval(maybePing, ManageIQ.login.timeout / 3 * 1000);

  idle = new idleJs({
    idle: 60000, // idle after a minute
    onActive: maybePing,
    onShow: maybePing,
  });
  idle.start();
}

// ping, except when hidden, inactive, or pinged in the last timeout/3 seconds
function maybePing() {
  const now = new Date() / 1000;

  if (! idle.visible) {
    console.log('bail: hidden');
    return;
  }

  if (idle.idle) {
    console.log('bail: idle');
    return;
  }

  // halving the timeout is not enough: if the server takes too long to respond, every other ping gets skipped
  if (now - last_ping < ManageIQ.login.timeout / 3) {
    console.log('bail: timeout', {timeout: ManageIQ.login.timeout, diff: now - last_ping, now, last_ping});
    return;
  }

  console.log('ping');
  ping();
}

// actually renews the cookie
function ping() {
  http.post('/ui/keepalive')
    .then((response) => {
      ManageIQ.login.timeout = response.timeout;
      last_ping = new Date() / 1000;
    })
    .catch(() => {
      window.add_flash(__("You have been logged out becuase of session timeout."), "warning");
      // TODO only when editing
      window.add_flash(__("Please make sure to log in in a different tab before submitting the form."), "info");
    });
}
