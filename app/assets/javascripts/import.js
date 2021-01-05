/* global miqSparkleOff miqSparkleOn */

var clearMessages = function() {
  clearFlash();
};

var showErrorMessage = function(message) {
  add_flash(message, 'error');
};

var showSuccessMessage = function(message) {
  add_flash(message, 'success');
};

var showWarningMessage = function(message) {
  add_flash(message, 'warning');
};

var ImportSetup = {
  setUpUploadImportButton: function(button_id) {
    var empty = ! $('#upload_file').val();
    $(button_id).prop('disabled', empty);
  },

  setupFileImport: function(options) {
    $(options.input).on('change', function() {
      ImportSetup.setUpUploadImportButton(options.button);
    });

    $(options.form).on('submit', function(e) {
      miqSparkleOn();

      miqJqueryRequest('/miq_ae_tools/upload_import_file', {
        data: new FormData(this),
        processData: false,
        contentType: false,
        cache: false,
      }).then(function(response) {
        ImportSetup.respondToPostMessages(JSON.parse(response));
      });

      e.preventDefault();
    });
  },

  respondToGitPostMessages: function(response) {
    miqSparkleOff();

    if (response.message && response.message.level === 'error') {
      showErrorMessage(response.message.message);
      $('#git-url-import').prop('disabled', null);
    } else if (response.git_branches || response.git_tags) {
      Automate.renderGitImport(
        response.git_branches,
        response.git_tags,
        response.git_repo_id,
        response.message
      );
    }
  },

  respondToPostMessages: function(response) {
    miqSparkleOff();
    clearMessages();

    var importFileUploadId = response.import_file_upload_id;

    if (importFileUploadId) {
      Automate.getAndRenderAutomateJson(importFileUploadId, response.message);
    } else {
      var messageData = response.message;

      if (messageData.level === 'warning') {
        showWarningMessage(messageData.message);
      } else {
        showErrorMessage(messageData.message);
      }
    }
  },
};

var setUpImportClickHandlers = function(url, grid, importCallback) {
  $('.import-commit').click(function() {
    miqSparkleOn();
    clearMessages();

    var serializedDialogs = '';
    $.each(grid.getData().getItems(), function(_index, item) {
      if ($.inArray(item.id, grid.getSelectedRows()) !== -1) {
        serializedDialogs += '&dialogs_to_import[]=' + item.name;
      }
    });

    $.post(url, $('#import-form').serialize() + serializedDialogs, function(data) {
      var flashMessage = data[0];
      if (flashMessage.level === 'error') {
        showErrorMessage(flashMessage.message);
      } else {
        showSuccessMessage(flashMessage.message);
      }

      $('.import-or-export').show();
      $('.import-data').hide();

      if (importCallback !== undefined) {
        importCallback();
      }

      miqSparkleOff();
    }, 'json');
  });

  $('.import-cancel').click(function() {
    miqSparkleOn();
    clearMessages();

    $.post('cancel_import', $('#import-form').serialize(), function(data) {
      var flashMessage = data[0];
      showSuccessMessage(flashMessage.message);

      $('.import-or-export').show();
      $('.import-data').hide();
      miqSparkleOff();
    }, 'json');
  });
};
