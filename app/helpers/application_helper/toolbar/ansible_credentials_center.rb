class ApplicationHelper::Toolbar::AnsibleCredentialsCenter < ApplicationHelper::Toolbar::Basic
  button_group('embedded_ansible_credentials', [
    select(
      :embedded_ansible_credentials_configuration,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :embedded_automation_manager_credentials_add,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Add New Credential'),
          t,
          :klass        => ApplicationHelper::Button::EmbeddedAnsible,
          :url_parms    => "new_div",
          :send_checked => true),
        button(
          :embedded_automation_manager_credentials_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this Credential'),
          t,
          :klass        => ApplicationHelper::Button::EmbeddedAnsible,
          :enabled      => false,
          :onwhen       => "1",
          :url_parms    => "edit_div",
          :send_checked => true),
        button(
          :embedded_automation_manager_credentials_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Remove selected Credentials from Inventory'),
          t,
          :klass        => ApplicationHelper::Button::EmbeddedAnsible,
          :url_parms    => "delete_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1+",
          :data         => {'function'      => 'sendDataWithRx',
                            'function-data' => {:controller     => 'provider_dialogs',
                                                :modal_title    => N_('Delete Credentials'),
                                                :modal_text     => N_('Are you sure you want to delete the following credentials?'),
                                                :api_url        => 'authentications',
                                                :async_delete   => true,
                                                :redirect_url   => '/ansible_credential/show_list',
                                                :component_name => 'RemoveGenericItemModal'}}),
      ]
    )
  ])
  button_group('embedded_ansible_credentials_policy', [
                 select(
                   :embedded_ansible_credentials_policy_choice,
                   nil,
                   t = N_('Policy'),
                   t,
                   :enabled => false,
                   :onwhen  => "1+",
                   :items   => [
                     button(
                       :ansible_credential_tag,
                       'pficon pficon-edit fa-lg',
                       N_('Edit Tags for the selected Ansible Credentials'),
                       N_('Edit Tags'),
                       :url_parms    => "main_div",
                       :send_checked => true,
                       :enabled      => false,
                       :onwhen       => "1+"
                     ),
                   ]
                 )
               ])
end
