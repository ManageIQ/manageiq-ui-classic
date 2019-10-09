class ApplicationHelper::Toolbar::AnsibleCredentialCenter < ApplicationHelper::Toolbar::Basic
  button_group('ansible_repository', [
    select(
      :ansible_credential_configuration,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :embedded_automation_manager_credentials_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this Credential'),
          t,
          :klass => ApplicationHelper::Button::EmbeddedAnsible,
          :url => "/edit"),
        button(
          :embedded_automation_manager_credentials_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Remove this Credential from Inventory'),
          t,
          :klass => ApplicationHelper::Button::EmbeddedAnsible,
          :url_parms => "&refresh=y",
          :confirm   => N_("Warning: The selected Credential will be permanently removed!")),
      ]
    ),
  ])
  button_group('embedded_ansible_credentials_policy', [
                 select(
                   :embedded_ansible_credentials_policy_choice,
                   nil,
                   t = N_('Policy'),
                   t,
                   :items => [
                     button(
                       :ansible_credential_tag,
                       'pficon pficon-edit fa-lg',
                       N_('Edit Tags for this Ansible Credential'),
                       N_('Edit Tags'),
                     ),
                   ]
                 )
               ])
end
