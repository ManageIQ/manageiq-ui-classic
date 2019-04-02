class ApplicationHelper::Toolbar::ConfigurationScriptCenter < ApplicationHelper::Toolbar::Basic
  button_group('configuration_script_vmdb', [
    select(
      :configuration_script_vmdb_choice,
      'fa fa-cog fa-lg',
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :configscript_service_dialog,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Create Service Dialog from this Template'),
          t),
      ]
    ),
    select(
      :automation_manager_policy_choice,
      'fa fa-shield fa-lg',
      t = N_('Policy'),
      t,
      :enabled => true,
      :items   => [
        button(
          :configuration_script_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for this Template'),
          N_('Edit Tags'),
          :url          => "tagging",
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => true),
      ]
    ),
  ])
end
