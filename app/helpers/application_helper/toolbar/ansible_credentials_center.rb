class ApplicationHelper::Toolbar::AnsibleCredentialsCenter < ApplicationHelper::Toolbar::Basic
  button_group('embedded_ansible_credentials', [
    select(
      :embedded_ansible_credentials_configuration,
      'fa fa-cog fa-lg',
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :embedded_automation_manager_credentials_add,
          'pficon pficon-edit fa-lg',
          t = N_('Add New Credential'),
          t,
          :url_parms => "new_div"),
        button(
          :embedded_automation_manager_credentials_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this Credential'),
          t,
          :enabled   => false,
          :onwhen => "1",
          :url_parms => "edit_div"),
        button(
          :embedded_automation_manager_credentials_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Remove selected Credentials'),
          t,
          :url_parms => "delete_div",
          :enabled   => false,
          :onwhen => "1+",
          :confirm   => N_("Warning: The selected Credentials will be permanently removed!")),
      ]
    )
  ])
end
