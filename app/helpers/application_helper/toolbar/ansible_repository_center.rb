class ApplicationHelper::Toolbar::AnsibleRepositoryCenter < ApplicationHelper::Toolbar::Basic
  button_group('ansible_repositories_reloading', [
    button(
      :ansible_repository_reload,
      'fa fa-refresh fa-lg',
      N_('Refresh this page'),
      N_(''),
      :url_parms    => "main_div",
      :send_checked => true,
      :klass        => ApplicationHelper::Button::ButtonWithoutRbacCheck),
  ])
  button_group('ansible_repository', [
    select(
      :ansible_repository_configuration,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :embedded_configuration_script_source_refresh,
          'fa fa-refresh fa-lg',
          N_('Refresh this Repository'),
          N_('Refresh this Repository'),
          :klass   => ApplicationHelper::Button::EmbeddedAnsible,
          :url     => "repository_refresh",
          :confirm => N_("Refresh this Repository?"),
          :enabled => true,
          :onwhen  => "1"),
        separator,
        button(
          :embedded_configuration_script_source_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this Repository'),
          t,
          :klass => ApplicationHelper::Button::EmbeddedAnsible,
          :url   => "/edit"),
        button(
          :embedded_configuration_script_source_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Remove this Repository from Inventory'),
          t,
          :klass => ApplicationHelper::Button::EmbeddedAnsible,
          :data  => {'function'      => 'sendDataWithRx',
                     'function-data' => {:controller     => 'provider_dialogs',
                                         :modal_title    => N_('Delete Repository'),
                                         :modal_text     => N_('Are you sure you want to delete the following repository?'),
                                         :api_url        => 'configuration_script_sources',
                                         :async_delete   => true,
                                         :redirect_url   => '/ansible_repository/show_list',
                                         :component_name => 'RemoveGenericItemModal'}}),
      ]
    ),
  ])
  button_group('ansible_repositories_policy', [
                 select(
                   :ansible_repositories_policy_choice,
                   nil,
                   t = N_('Policy'),
                   t,
                   :items => [
                     button(
                       :ansible_repository_tag,
                       'pficon pficon-edit fa-lg',
                       N_('Edit Tags for this Ansible Repository'),
                       N_('Edit Tags'),
                     ),
                   ]
                 )
               ])
end
