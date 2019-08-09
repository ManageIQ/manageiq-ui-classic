class ApplicationHelper::Toolbar::ConfigurationScriptsCenter < ApplicationHelper::Toolbar::Basic
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
          t,
          :onwhen => '1',
          :send_checked => true
        ),
      ]
    )
  ])

  include ApplicationHelper::Toolbar::ConfigurationScripts::PolicyMixin
end
