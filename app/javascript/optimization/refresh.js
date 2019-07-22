export function refresh() {
  if (refresh.url === null) {
    console.error("optimize: refresh not initialized");
    return;
  }

  window.miqSparkleOn();

  return http.get(refresh.url)
    .then((data) => {
      refresh.set(data);

      window.miqSparkleOff();
      return data;
    })
    .catch(() => window.miqSparkleOff());
}

// overriden on OptimizationList init
refresh.url = null;
refresh.set = console.error;
