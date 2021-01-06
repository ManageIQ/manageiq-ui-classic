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
