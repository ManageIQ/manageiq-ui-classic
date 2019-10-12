class ApplicationHelper::Toolbar::DiagnosticsZoneCenter < ApplicationHelper::Toolbar::Basic
  extend ApplicationHelper::Toolbar::ServerMixin

  button_group('support_reloading', [
    button(
      :reload_server_tree,
      'fa fa-refresh fa-lg',
      N_('Refresh this page'),
      nil,
      :klass => ApplicationHelper::Button::ReloadServerTree),
  ])
  button_group('ldap_domain_vmdb', [
    select(
      :zone_configuration_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :zone_delete_server,
          'pficon pficon-delete fa-lg',
          t = proc do
            _('Delete Server %{server_name} [%{server_id}]') % {:server_name => @record.name, :server_id => @record.id}
          end,
          t,
          :confirm => proc do
                        _("Do you want to delete Server %{server_name} [%{server_id}]?") % {
                          :server_name => @record.name,
                          :server_id   => @record.id
                        }
                      end,
          :klass   => ApplicationHelper::Button::ZoneDeleteServer
        ),
        button(
          :zone_role_start,
          'fa fa-play-circle-o fa-lg',
          server_role_string_proc(_('Start the %{server_role_description} Role on Server %{server_name} [%{server_id}]')),
          N_('Start Role'),
          :confirm => server_role_string_proc(_("Start the %{server_role_description} Role on Server %{server_name} [%{server_id}]?")),
          :klass => ApplicationHelper::Button::RolePowerOptions
        ),
        button(
          :zone_role_suspend,
          'fa fa-pause-circle-o fa-lg',
          server_role_string_proc(_('Suspend the %{server_role_description} Role on Server %{server_name} [%{server_id}]')),
          N_('Suspend Role'),
          :confirm => server_role_string_proc(_("Suspend the %{server_role_description} Role on Server %{server_name} [%{server_id}]?")),
          :klass => ApplicationHelper::Button::RolePowerOptions
        ),
        button(
          :zone_demote_server,
          'pficon pficon-delete fa-lg',
          server_role_string_proc(_('Demote Server %{server_name} [%{server_id}] to secondary for the %{server_role_description} Role')),
          N_('Demote Server'),
          :confirm => N_("Do you want to demote this Server to secondary?  This will leave no primary Server for this Role."),
          :klass => ApplicationHelper::Button::ServerLevelOptions
        ),
        button(
          :zone_promote_server,
          'fa fa-reply fa-rotate-90 fa-lg',
          server_role_string_proc(_('Promote Server %{server_name} [%{server_id}] to primary for the %{server_role_description} Role')),
          N_('Promote Server'),
          :confirm => N_("Do you want to promote this Server to primary?  This will replace any existing primary Server for this Role."),
          :klass => ApplicationHelper::Button::ServerLevelOptions
        ),
      ]
    ),
    select(
      :zone_collect_logs_choice,
      'fa fa-filter fa-lg',
      N_('Collect Logs'),
      N_('Collect'),
      :items => [
        button(
          :zone_collect_current_logs,
          'fa fa-filter fa-lg',
          N_('Collect the current logs from the selected Zone'),
          N_('Collect current logs'),
          :klass => ApplicationHelper::Button::ZoneCollectLogs
        ),
        button(
          :zone_collect_logs,
          'fa fa-filter fa-lg',
          N_('Collect all logs from the selected Zone'),
          N_('Collect all logs'),
          :klass => ApplicationHelper::Button::ZoneCollectLogs
        ),
      ]
    ),
    button(
      :zone_log_depot_edit,
      'pficon pficon-edit fa-lg',
      N_('Edit the Log Depot settings for the selected Zone'),
      N_('Edit'),
      :klass => ApplicationHelper::Button::LogDepotEdit),
  ])
end
