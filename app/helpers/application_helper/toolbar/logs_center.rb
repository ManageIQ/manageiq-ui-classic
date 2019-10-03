class ApplicationHelper::Toolbar::LogsCenter < ApplicationHelper::Toolbar::Basic
  button_group('log_reloading', [
    button(
      :refresh_log,
      'fa fa-refresh fa-lg',
      N_('Refresh this page'),
      nil),
    button(
      :fetch_log,
      'fa fa-download fa-lg',
      proc do
        _('Download the Entire %{log_type} Log File') % {:log_type => @msg_title}
      end,
      nil,
      :url => "/fetch_log"),
  ])
end
