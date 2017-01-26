/* global miqInitSelectPicker miqSelectPickerEvent miqSparkle miqSparkleOn */

var dialogFieldRefresh = {
  listenForAutoRefreshMessages: function(autoRefreshOptions, callbackFunction) {
    var thisIsTheFieldToUpdate = function(event) {
      tabIndex = event.data.tabIndex;
      groupIndex = event.data.groupIndex;
      fieldIndex = event.data.fieldIndex;
      return tabIndex === autoRefreshOptions.tab_index && groupIndex === autoRefreshOptions.group_index && fieldIndex === autoRefreshOptions.field_index;
    };

    window.addEventListener('message', function(event) {
      if (thisIsTheFieldToUpdate(event)) {
        callbackFunction.call();
      }
    });
  },

  initializeDialogSelectPicker: function(fieldName, selectedValue, url, autoRefreshOptions) {
    miqInitSelectPicker();
    if (selectedValue !== undefined) {
      $('#' + fieldName).selectpicker('val', selectedValue);
    }

    miqSelectPickerEvent(fieldName, url, {callback: function() {
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
      done: callback
    });
  },

  refreshCheckbox: function(fieldName, fieldId, callback) {
    miqSparkleOn();

    var data = {name: fieldName};
    var doneFunction = function(data) {
      var responseData = JSON.parse(data.responseText);
      $('.dynamic-checkbox-' + fieldId).prop('checked', responseData.values.checked);
      dialogFieldRefresh.setReadOnly($('.dynamic-checkbox-' + fieldId), responseData.values.read_only);
      dialogFieldRefresh.setVisible($('#field_' +fieldId + '_tr'), responseData.values.visible);
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
      dialogFieldRefresh.setVisible($('#field_' +fieldId + '_tr'), responseData.values.visible);
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
      dialogFieldRefresh.setVisible($('#field_' +fieldId + '_tr'), responseData.values.visible);
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

  refreshTextAreaBox: function(fieldName, fieldId, callback) {
    miqSparkleOn();

    var data = {name: fieldName};
    var doneFunction = function(data) {
      var responseData = JSON.parse(data.responseText);
      $('.dynamic-text-area-' + fieldId).val(responseData.values.text);
      dialogFieldRefresh.setReadOnly($('.dynamic-text-area-' + fieldId), responseData.values.read_only);
      dialogFieldRefresh.setVisible($('#field_' +fieldId + '_tr'), responseData.values.visible);
      callback.call();
    };

    dialogFieldRefresh.sendRefreshRequest('dynamic_text_box_refresh', data, doneFunction);
  },

  refreshTextBox: function(fieldName, fieldId, callback) {
    miqSparkleOn();

    var data = {name: fieldName};
    var doneFunction = function(data) {
      var responseData = JSON.parse(data.responseText);
      $('.dynamic-text-box-' + fieldId).val(responseData.values.text);
      dialogFieldRefresh.setReadOnly($('.dynamic-text-box-' + fieldId), responseData.values.read_only);
      dialogFieldRefresh.setVisible($('#field_' +fieldId + '_tr'), responseData.values.visible);
      callback.call();
    };

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
      var groupIndex = autoRefreshOptions.group_index;
      var fieldIndex = autoRefreshOptions.field_index;
      var autoRefreshableIndicies = autoRefreshOptions.auto_refreshable_field_indicies;
      var nextAvailableAutoRefreshFieldIndex;
      var nextAvailableAutoRefreshGroupIndex;
      var foundNextAvailable = false;

      $.each(autoRefreshableIndicies, function(refreshableGroupIndex, refreshableGroup) {
        if (foundNextAvailable === false && refreshableGroup[0] !== undefined) {
          if (groupIndex < refreshableGroupIndex) {
            $.each(refreshableGroup, function(refreshableFieldIndex, refreshableField) {
              nextAvailableAutoRefreshFieldIndex = autoRefreshableIndicies[refreshableGroupIndex][refreshableFieldIndex];
              nextAvailableAutoRefreshGroupIndex = refreshableGroupIndex;
              foundNextAvailable = true;
            });
          } else if (groupIndex === refreshableGroupIndex) {
            $.each(refreshableGroup, function(refreshableFieldIndex, refreshableField) {
              if (fieldIndex < refreshableField && foundNextAvailable === false) {
                nextAvailableAutoRefreshFieldIndex = autoRefreshableIndicies[refreshableGroupIndex][refreshableFieldIndex];
                nextAvailableAutoRefreshGroupIndex = refreshableGroupIndex;
                foundNextAvailable = true;
              }
            });
          }
        }
      });

      if (nextAvailableAutoRefreshFieldIndex !== undefined) {
        parent.postMessage({
          tabIndex: autoRefreshOptions.tab_index,
          groupIndex: nextAvailableAutoRefreshGroupIndex,
          fieldIndex: nextAvailableAutoRefreshFieldIndex,
        }, '*');
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
    miqJqueryRequest(url, {
      data: data,
      dataType: 'json',
      beforeSend: true,
      complete: true,
      done: doneFunction
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
        radio.attr('title', __("This element is disabled because it is read only"));
        radio.prop('disabled', true);
      } else {
        radio.on('click', function(event) {
          dialogFieldRefresh.radioButtonSelectEvent(url, fieldId, function() {
            dialogFieldRefresh.triggerAutoRefresh(autoRefreshOptions);
          });
        });
      }

      radio.appendTo($('#dynamic-radio-' + fieldId));
      label.appendTo($('#dynamic-radio-' + fieldId));
    });
  }
};
