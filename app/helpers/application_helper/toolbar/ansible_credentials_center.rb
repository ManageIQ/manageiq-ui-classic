class ApplicationHelper::Toolbar::AnsibleCredentialsCenter < ApplicationHelper::Toolbar::Basic
  button_group('embedded_ansible_credentials', [
    select(
      :embedded_ansible_credentials_configuration,
      'fa fa-cog fa-lg',
      t = N_('Configuration'),
      t,
      :items => [
       button(
          :embedded_automation_manager_credentials_refresh,
          'fa fa-refresh fa-lg',
          N_('Refresh Embedded Ansible Provider'),
          N_('Refresh Embedded Ansible Provider'),
          :klass => ApplicationHelper::Button::EmbeddedAnsible,
          :url       => "credential_refresh",
          :url_parms => "main_div",
          :confirm   => N_("Refresh relationships for all items from Embedded Ansible Provider?"),
          :enabled   => true),
        separator,
        button(
          :embedded_automation_manager_credentials_add,
          'pficon pficon-edit fa-lg',
          t = N_('Add New Credential'),
          t,
          :klass => ApplicationHelper::Button::EmbeddedAnsible,
          :url_parms => "new_div"),
        button(
          :embedded_automation_manager_credentials_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this Credential'),
          t,
          :klass => ApplicationHelper::Button::EmbeddedAnsible,
          :enabled   => false,
          :onwhen => "1",
          :url_parms => "edit_div"),
        button(
          :embedded_automation_manager_credentials_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Remove selected Credentials'),
          t,
          :klass => ApplicationHelper::Button::EmbeddedAnsible,
          :url_parms => "delete_div",
          :enabled   => false,
          :onwhen => "1+",
          :confirm   => N_("Warning: The selected Credentials will be permanently removed!")),
      ]
    )
  ])
end
