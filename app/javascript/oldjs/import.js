// This file contains legacy code still used by:
// - app/views/miq_policy_export/_export.html.haml
// - app/views/report/_export_widgets.html.haml
// - app/views/report/_export_custom_reports.html.haml

window.ImportSetup = {
  setUpUploadImportButton: function(button_id) {
    if ($('#upload_file').val()) {
      $(button_id).prop('disabled', false);
    } else {
      $(button_id).prop('disabled', true);
    }
  },
};
