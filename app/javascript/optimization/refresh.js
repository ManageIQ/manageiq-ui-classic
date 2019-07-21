export function refresh() {
  if (refresh.url === null) {
    console.error("optimize: refresh not initialized");
    return;
  }

  window.miqSparkleOn();

  return http.get(refresh.url)
    .then((data) => {
      window.miqSparkleOff();
      console.log('TODO refresh', data);
      return data;
    })
    .catch(() => window.miqSparkleOff());
}

refresh.url = null;
