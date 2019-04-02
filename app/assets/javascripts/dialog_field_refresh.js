/* global miqInitSelectPicker miqObserveRequest miqSelectPickerEvent miqSparkle miqSparkleOn */

var dialogFieldRefresh = {
  unbindAllPreviousListeners: function() {
    $(document).off('dialog::autoRefresh');
  },

  listenForAutoRefreshMessages: function(autoRefreshOptions, callbackFunction) {
    var thisIsTheFieldToUpdate = function(data) {
      var tabIndex = data.tabIndex;
      var groupIndex = data.groupIndex;
      var fieldIndex = data.fieldIndex;
      return tabIndex === autoRefreshOptions.tab_index && groupIndex === autoRefreshOptions.group_index && fieldIndex === autoRefreshOptions.field_index;
    };

    $(document).on('dialog::autoRefresh', function(_event, data) {
      if (thisIsTheFieldToUpdate(data)) {
        callbackFunction.call(null, data.initializingIndex);
      }
    });
  },

  initializeDialogSelectPicker: function(fieldName, selectedValue, url, autoRefreshOptions) {
    miqInitSelectPicker();
    if (selectedValue !== undefined) {
      $('#' + fieldName).selectpicker('val', selectedValue);
    }

    miqSelectPickerEvent(fieldName, url, {callback: function() {
      autoRefreshOptions.initial_trigger = true;
      dialogFieldRefresh.triggerAutoRefresh(autoRefreshOptions);
      return true;
    }});
  },

  initializeRadioButtonOnClick: function(fieldId, url, autoRefreshOptions) {
    $('#dynamic-radio-' + fieldId).children('input').on('click', function() {
      dialogFieldRefresh.radioButtonSelectEvent(url, fieldId, function() {
        dialogFieldRefresh.triggerAutoRefresh(autoRefreshOptions);
      });
    });
  },

  radioButtonSelectEvent: function(url, fieldId, callback) {
    miqObserveRequest(url, {
      data: miqSerializeForm('dynamic-radio-' + fieldId),
      dataType: 'script',
      beforeSend: true,
      complete: true,
      done: callback,
    });
  },

  refreshField: function(options, callback) {
    var fieldType = options.type;

    if (fieldType === 'DialogFieldCheckBox') {
      dialogFieldRefresh.refreshCheckbox(options.name, options.id, callback);
    } else if (fieldType === 'DialogFieldTextBox') {
      dialogFieldRefresh.refreshTextBox(options.name, options.id, callback);
    } else if (fieldType === 'DialogFieldTextAreaBox') {
      dialogFieldRefresh.refreshTextAreaBox(options.name, options.id, callback);
    } else if (fieldType === 'DialogFieldDropDownList') {
      var selectedValue = $('select[name="' + options.name + '"]').val();
      dialogFieldRefresh.refreshDropDownList(options.name, options.id, selectedValue, callback);
    } else if (fieldType === 'DialogFieldRadioButton') {
      var checkedValue = $('input:radio[name="' + options.name + '"]:checked').val();

      dialogFieldRefresh.refreshRadioList(options.name, options.id, checkedValue, options.url, options.auto_refresh_options, callback);
    } else if (fieldType === 'DialogFieldDateControl' || fieldType === 'DialogFieldDateTimeControl') {
      dialogFieldRefresh.refreshDateTime(options.name, options.id, callback);
    } else {
      add_flash(__('Field type is not a supported type!'), 'error');
    }
  },

  refreshCheckbox: function(fieldName, fieldId, callback) {
    miqSparkleOn();

    var data = {name: fieldName};
    var doneFunction = function(data) {
      var responseData = JSON.parse(data.responseText);
      $('.dynamic-checkbox-' + fieldId).prop('checked', responseData.values.checked);
      dialogFieldRefresh.setReadOnly($('.dynamic-checkbox-' + fieldId), responseData.values.read_only);
      dialogFieldRefresh.setVisible($('#field_' + fieldId + '_tr'), responseData.values.visible);
      callback.call();
    };

    dialogFieldRefresh.sendRefreshRequest('dynamic_checkbox_refresh', data, doneFunction);
  },

  refreshDateTime: function(fieldName, fieldId, callback) {
    miqSparkleOn();

    var data = {name: fieldName};
    var doneFunction = function(data) {
      var responseData = JSON.parse(data.responseText);
      $('.dynamic-date-' + fieldId).val(responseData.values.date);

      if (responseData.values.hour !== undefined && responseData.values.min !== undefined) {
        $('.dynamic-date-hour-' + fieldId).val(responseData.values.hour);
        $('.dynamic-date-min-' + fieldId).val(responseData.values.min);
      }

      dialogFieldRefresh.setReadOnly($('.dynamic-date-' + fieldId), responseData.values.read_only);
      dialogFieldRefresh.setVisible($('#field_' + fieldId + '_tr'), responseData.values.visible);
      callback.call();
    };

    dialogFieldRefresh.sendRefreshRequest('dynamic_date_refresh', data, doneFunction);
  },

  refreshDropDownList: function(fieldName, fieldId, selectedValue, callback) {
    miqSparkleOn();

    var data = {name: fieldName, checked_value: selectedValue};
    var doneFunction = function(data) {
      var responseData = JSON.parse(data.responseText);
      dialogFieldRefresh.addOptionsToDropDownList(responseData, fieldId);
      dialogFieldRefresh.setReadOnly($('#' + fieldName), responseData.values.read_only);
      dialogFieldRefresh.setVisible($('#field_' + fieldId + '_tr'), responseData.values.visible);
      $('#' + fieldName).selectpicker('refresh');
      $('#' + fieldName).selectpicker('val', responseData.values.checked_value);
      callback.call();
    };

    dialogFieldRefresh.sendRefreshRequest('dynamic_radio_button_refresh', data, doneFunction);
  },

  refreshRadioList: function(fieldName, fieldId, checkedValue, url, autoRefreshOptions, callback) {
    miqSparkleOn();

    var data = {name: fieldName, checked_value: checkedValue};
    var doneFunction = function(data) {
      var responseData = JSON.parse(data.responseText);
      dialogFieldRefresh.replaceRadioButtons(fieldId, fieldName, responseData, url, autoRefreshOptions);

      callback.call();
    };

    dialogFieldRefresh.sendRefreshRequest('dynamic_radio_button_refresh', data, doneFunction);
  },

  updateTextContainerDoneFunction: function(containerSelector, fieldId, data, callback) {
    var responseData = JSON.parse(data.responseText);
    $(containerSelector + fieldId).val(responseData.values.text);
    dialogFieldRefresh.setReadOnly($(containerSelector + fieldId), responseData.values.read_only);
    dialogFieldRefresh.setVisible($('#field_' + fieldId + '_tr'), responseData.values.visible);
    callback.call();
  },

  refreshTextAreaBox: function(fieldName, fieldId, callback) {
    miqSparkleOn();

    var doneFunction = function(data) {
      dialogFieldRefresh.updateTextContainerDoneFunction('.dynamic-text-area-', fieldId, data, callback);
    };

    var data = {name: fieldName};
    dialogFieldRefresh.sendRefreshRequest('dynamic_text_box_refresh', data, doneFunction);
  },

  refreshTextBox: function(fieldName, fieldId, callback) {
    miqSparkleOn();

    var doneFunction = function(data) {
      dialogFieldRefresh.updateTextContainerDoneFunction('.dynamic-text-box-', fieldId, data, callback);
    };

    var data = {name: fieldName};
    dialogFieldRefresh.sendRefreshRequest('dynamic_text_box_refresh', data, doneFunction);
  },

  addOptionsToDropDownList: function(data, fieldId) {
    var dropdownOptions = [];

    $.each(data.values.refreshed_values, function(index, value) {
      var option = $('<option></option>');

      option.val(value[0]);
      option.text(value[1]);

      if (data.values.checked_value !== null) {
        if (value[0] !== null) {
          if (data.values.checked_value.toString() === String(value[0])) {
            option.prop('selected', true);
          }
        }
      } else if (index === 0) {
        option.prop('selected', true);
      }

      dropdownOptions.push(option);
    });

    $('.dynamic-drop-down-' + fieldId + '.selectpicker').html(dropdownOptions);
    $('.dynamic-drop-down-' + fieldId + '.selectpicker').selectpicker('refresh');
  },

  triggerAutoRefresh: function(autoRefreshOptions) {
    if (Boolean(autoRefreshOptions.trigger) === true) {
      var autoRefreshableIndicies = autoRefreshOptions.auto_refreshable_field_indicies;
      var currentIndex;
      var initializingIndex;

      if (autoRefreshOptions.initial_trigger === true) {
        currentIndex = 0;
        initializingIndex = autoRefreshOptions.current_index;
      } else {
        currentIndex = autoRefreshOptions.current_index;
        initializingIndex = autoRefreshOptions.initializingIndex;
      }

      var nextAvailable = $.grep(autoRefreshableIndicies, function(potential, potentialsIndex) {
        return (potential.auto_refresh === true && potentialsIndex > currentIndex && potentialsIndex !== initializingIndex);
      });

      nextAvailable = nextAvailable[0];

      if (nextAvailable !== undefined) {
        $(document).trigger('dialog::autoRefresh', {
          tabIndex: nextAvailable.tab_index,
          groupIndex: nextAvailable.group_index,
          fieldIndex: nextAvailable.field_index,
          initializingIndex: initializingIndex,
        });
      }
    }
  },

  setReadOnly: function(field, readOnly) {
    if (readOnly === true) {
      field.attr('title', __('This element is disabled because it is read only'));
      field.prop('disabled', true);
    } else {
      field.prop('disabled', false);
      field.attr('title', '');
    }
  },

  sendRefreshRequest: function(url, data, doneFunction) {
    miqObserveRequest(url, {
      data: data,
      dataType: 'json',
      beforeSend: true,
      complete: true,
      done: doneFunction,
    });
  },

  setVisible: function(field, visible) {
    if (visible === true) {
      field.show();
    } else {
      field.hide();
    }
  },

  replaceRadioButtons: function(fieldId, fieldName, responseData, url, autoRefreshOptions) {
    $('#dynamic-radio-' + fieldId).children().remove();

    $.each(responseData.values.refreshed_values, function(_index, value) {
      var radio = $('<input>')
        .attr('class', fieldId)
        .attr('name', fieldName)
        .attr('type', 'radio')
        .val(value[0]);

      var label = $('<label></label>')
        .attr('for', value[0])
        .addClass('dynamic-radio-label')
        .text(value[1]);

      if (responseData.values.checked_value === String(value[0])) {
        radio.prop('checked', true);
      }

      if (responseData.values.read_only === true) {
        radio.attr('title', __('This element is disabled because it is read only'));
        radio.prop('disabled', true);
      } else {
        radio.on('click', function() {
          dialogFieldRefresh.radioButtonSelectEvent(url, fieldId, function() {
            dialogFieldRefresh.triggerAutoRefresh(autoRefreshOptions);
          });
        });
      }

      radio.appendTo($('#dynamic-radio-' + fieldId));
      label.appendTo($('#dynamic-radio-' + fieldId));
    });
  },
};
