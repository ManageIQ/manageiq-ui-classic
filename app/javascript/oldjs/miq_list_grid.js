// Needed for optimization page queue report button
window.miqQueueReport = function(id) {
  const url = `/optimization/queue_report/${id}`;
  window.miqSparkleOn();
  http
    .post(url, {})
    .then((data) => {
      window.add_flash(data.flash, 'success');
      window.miqSparkleOff();
    })
    .catch(() => window.miqSparkleOff());
};
