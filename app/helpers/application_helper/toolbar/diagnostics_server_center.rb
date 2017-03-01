class ApplicationHelper::Toolbar::DiagnosticsServerCenter < ApplicationHelper::Toolbar::Basic
  button_group('support_reloading', [
    button(
      :refresh_server_summary,
      'fa fa-repeat fa-lg',
      N_('Reload Current Display'),
      nil,
      :klass => ApplicationHelper::Button::DiagnosticsSummary),
    button(
      :refresh_workers,
      'fa fa-repeat fa-lg',
      N_('Reload current workers display'),
      nil,
      :klass => ApplicationHelper::Button::RefreshWorkers),
    button(
      :refresh_audit_log,
      'fa fa-repeat fa-lg',
      N_('Reload the Audit Log Display'),
      nil,
      :klass => ApplicationHelper::Button::DiagnosticsAuditLogs),
    button(
      :fetch_audit_log,
      'fa fa-download fa-lg',
      N_('Download the Entire Audit Log File'),
      nil,
      :url   => "/fetch_audit_log",
      :klass => ApplicationHelper::Button::DiagnosticsAuditLogs),
    button(
      :refresh_log,
      'fa fa-repeat fa-lg',
      N_('Reload the EVM Log Display'),
      nil,
      :klass => ApplicationHelper::Button::DiagnosticsEvmLogs),
    button(
      :fetch_log,
      'fa fa-download fa-lg',
      N_('Download the Entire EVM Log File'),
      nil,
      :url   => "/fetch_log",
      :klass => ApplicationHelper::Button::DiagnosticsEvmLogs),
    button(
      :refresh_production_log,
      'fa fa-repeat fa-lg',
      proc do
        _('Reload the %{log_type} Log Display') % {:log_type => _(@sb[:rails_log])}
      end,
      nil,
      :klass => ApplicationHelper::Button::DiagnosticsProductionLogs),
    button(
      :fetch_production_log,
      'fa fa-download fa-lg',
      proc do
        _('Download the Entire %{log_type} Log File') % {:log_type => _(@sb[:rails_log])}
      end,
      nil,
      :url   => "/fetch_production_log",
      :klass => ApplicationHelper::Button::DiagnosticsProductionLogs),
  ])
  button_group('ldap_domain_vmdb', [
    select(
      :server_collect_logs_choice,
      'fa fa-filter fa-lg',
      N_('Collect Logs'),
      N_('Collect'),
      :items => [
        button(
          :collect_current_logs,
          'fa fa-filter fa-lg',
          N_('Collect the current logs from the selected Server'),
          N_('Collect current logs'),
          :klass => ApplicationHelper::Button::DiagnosticsLogs
        ),
        button(
          :collect_logs,
          'fa fa-filter fa-lg',
          N_('Collect all logs from the selected Server'),
          N_('Collect all logs'),
          :klass => ApplicationHelper::Button::DiagnosticsLogs
        ),
      ]
    ),
    button(
      :log_depot_edit,
      'pficon pficon-edit fa-lg',
      N_('Edit the Log Depot settings for the selected Server'),
      N_('Edit'),
      :klass => ApplicationHelper::Button::DiagnosticsLogs),
    select(
      :restart_vmdb_choice,
      'fa fa-cog fa-lg',
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :restart_server,
          'pficon pficon-restart',
          t = N_('Restart server'),
          t,
          :confirm => N_("Warning: Server will be restarted, do you want to continue?"),
          :klass   => ApplicationHelper::Button::DiagnosticsSummary),
        button(
          :restart_workers,
          'pficon pficon-restart',
          N_('Select a worker to restart'),
          N_('Restart selected worker'),
          :confirm => N_("Warning: Selected node will be restarted, do you want to continue?"),
          :klass   => ApplicationHelper::Button::RestartWorkers),
      ]
    ),
  ])
end
