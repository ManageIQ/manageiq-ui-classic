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
      '',
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
          :klass     => ApplicationHelper::Button::EmbeddedAnsible,
          :url_parms => "&refresh=y",
          :confirm   => N_("Warning: The selected Repository will be permanently removed!")),
      ]
    ),
  ])
  button_group('ansible_repositories_policy', [
                 select(
                   :ansible_repositories_policy_choice,
                   '',
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
