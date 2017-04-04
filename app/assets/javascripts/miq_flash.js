// add a flash message to an existing #flash_msg_div
// levels are error, warning, info, success
function add_flash(msg, level, options) {
  level = level || 'success';
  options = options || {};
  var cls = { alert: '', icon: '' };

  switch (level) {
    case 'error':
      cls.alert = 'alert alert-danger';
      cls.icon = 'pficon pficon-error-circle-o';
      break;
    case 'warn':  // miqFlash compatibility
    case 'warning':
      cls.alert = 'alert alert-warning';
      cls.icon = 'pficon pficon-warning-triangle-o';
      break;
    case 'info':
      cls.alert = 'alert alert-info';
      cls.icon = 'pficon pficon-info';
      break;
    case 'success':
      cls.alert = 'alert alert-success';
      cls.icon = 'pficon pficon-ok';
      break;
  }

  var icon_span = $('<span class="' + cls.icon + '"></span>');

  var text_strong = $('<strong></strong>');
  text_strong.text(msg);

  var alert_div = $('<div class="' + cls.alert + '"></div>');
  alert_div.append(icon_span, text_strong);

  var text_div = $('<div class="flash_text_div"></div>');
  text_div.attr('title', __('Click to remove message'));
  text_div.on('click', function() {
    text_div.remove();
  });
  text_div.append(alert_div);

  // if options.id is provided, only one flash message with that id may exist
  if (options.id) {
    $('#' + options.id).filter('#flash_msg_div > *').remove();
    text_div.attr('id', options.id);
  }

  $('#flash_msg_div').append(text_div).show();
}
