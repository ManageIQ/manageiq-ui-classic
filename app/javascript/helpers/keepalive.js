/* global miqInAForm */
import idleJs from 'idle-js';

let last_ping = new Date() / 1000;
let idle = null;
let interval = null;
let stopped = true;

export default function miqKeepAlive() {
  if (! ManageIQ.login.timeout) {
    console.warning('Not initializing keepalive, no session timeout info.');
    return;
  }

  stopped = false;

  interval = window.setInterval(maybePing, ManageIQ.login.timeout / 3 * 1000);

  idle = new idleJs({
    idle: 60000, // idle after a minute
    // setTimeout - workaround for https://github.com/soixantecircuits/idle-js/issues/6
    onActive: () => setTimeout(maybePing, 1000),
    onShow: maybePing,
  });
  idle.start();
}

// ping, except when hidden, inactive, or pinged in the last timeout/3 seconds
function maybePing() {
  if (stopped) {
    return;
  }

  const now = new Date() / 1000;

  if (! idle.visible) {
    return;
  }

  if (idle.idle) {
    return;
  }

  // halving the timeout is not enough: if the server takes too long to respond, every other ping gets skipped
  if (now - last_ping < ManageIQ.login.timeout / 3) {
    return;
  }

  ping();
}

// actually renews the cookie
function ping() {
  http.post('/ui/keepalive', {}, {
    skipErrors: [401, 422], // logged out, invalid csrf
  })
    .then((response) => {
      ManageIQ.login.timeout = response.timeout;
      last_ping = new Date() / 1000;
    })
    .catch(() => {
      window.add_flash(__('You have been logged out because of session timeout.'), 'warning');

      if (miqInAForm()) {
        window.add_flash(__('Please make sure to log in in a different tab before submitting the form.'), 'info');
      }

      stop();
    });
}

function stop() {
  window.clearInterval(interval);
  interval = null;

  // idle.stop();
  stopped = true;
}

miqKeepAlive.ping = ping;
miqKeepAlive.stop = stop;
