class ApplicationHelper::Toolbar::AnsibleCredentialCenter < ApplicationHelper::Toolbar::Basic
  button_group('ansible_repository', [
    select(
      :ansible_credential_configuration,
      'fa fa-cog fa-lg',
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :embedded_automation_manager_credentials_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this Credential'),
          t,
          :url => "/edit"),
        button(
          :embedded_automation_manager_credentials_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Remove this Credential'),
          t,
          :url_parms => "&refresh=y",
          :confirm   => N_("Warning: The selected Credential will be permanently removed!")),
      ]
    ),
  ])
end
