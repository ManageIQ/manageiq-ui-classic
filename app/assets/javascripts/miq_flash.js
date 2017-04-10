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
    default:
      throw("add_flash: unknown level: " + level);
  }

  var iconSpan = $('<span class="' + cls.icon + '"></span>');

  var textStrong = $('<strong></strong>');
  textStrong.text(msg);

  var alertDiv = $('<div class="' + cls.alert + '"></div>');
  alertDiv.append(iconSpan, textStrong);

  var textDiv = $('<div class="flash_text_div"></div>');
  textDiv.attr('title', __('Click to remove message'));
  textDiv.on('click', function() {
    textDiv.remove();
  });
  textDiv.append(alertDiv);

  // if options.id is provided, only one flash message with that id may exist
  if (options.id) {
    $('#' + options.id).filter('#flash_msg_div > *').remove();
    textDiv.attr('id', options.id);
  }

  $('#flash_msg_div').append(textDiv).show();
}

function _miqFlashLoad() {
  return JSON.parse(sessionStorage.getItem('flash_msgs') || '[]');
}
function _miqFlashSave(arr) {
  return sessionStorage.setItem('flash_msgs', JSON.stringify(arr));
}

// stores a flash message (keys: message, level) for later
function miqFlashLater(object) {
  var ary = _miqFlashLoad();
  ary.push(object);
  _miqFlashSave(ary);
}

// shows all stored flash messages
function miqFlashSaved() {
  var ary = _miqFlashLoad();
  ary.forEach(function(obj) {
    add_flash(obj.message, obj.level);
  });

  miqFlashClearSaved();
}

// also called on login
function miqFlashClearSaved() {
  _miqFlashSave([]);
}
