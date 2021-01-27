import { renderToastWrapper, setupErrorHandlers } from '../components/miq_debug/';

const { miqSparkleOff, $ } = window;

// NOTE: this file is only included in development mode

// CTRL+SHIFT+X stops the spinner
$(document).bind('keyup', 'ctrl+shift+x', miqSparkleOff);

// Warn for duplicate DOM IDs
const duplicate = () => {
  $('[id]').each(function() {
    var ids = $('[id="' + this.id + '"]');
    if (ids.length > 1 && $.inArray(this, ids) !== -1) {
      console.warn('Duplicate DOM ID #' + this.id, this);
    }
  });
};
$(duplicate);
$(document).bind('ajaxComplete', duplicate);

// toast on error
$(() => {
  var el = $('<div class="toast-wrapper"></div>');
  el.appendTo(document.body);

  renderToastWrapper(el[0]);
  setupErrorHandlers();
});
