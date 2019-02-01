let last_ping = new Date() / 1000;

export default function miqKeepAlive() {
  if (! ManageIQ.login.timeout) {
    console.warning('Not initializing keepalive, no session timeout info.');
    return;
  }

  if (document.hidden === undefined) {
    console.warning('Not initializing keepalive, Page Visibility API unsupported.');
    return;
  }

  document.addEventListener("visibilitychange", maybePing);
  window.setInterval(maybePing, ManageIQ.login.timeout / 2 * 1000);
}

// ping, except when hidden, or pinged in the last timeout/2 seconds
function maybePing() {
  const now = new Date() / 1000;

  if (document.hidden) {
    return;
  }

  if (now - last_ping < ManageIQ.login.timeout / 2) {
    return;
  }

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
