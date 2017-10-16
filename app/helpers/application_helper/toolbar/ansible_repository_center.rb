class ApplicationHelper::Toolbar::AnsibleRepositoryCenter < ApplicationHelper::Toolbar::Basic
  button_group('ansible_repositories_reloading', [
    button(
      :ansible_repository_reload,
      'fa fa-repeat fa-lg',
      N_('Reload the current display'),
      N_('Reload'),
      :url_parms    => ":display => @display",
      :send_checked => true,
      :klass        => ApplicationHelper::Button::ButtonWithoutRbacCheck),
  ])
  button_group('ansible_repository', [
    select(
      :ansible_repository_configuration,
      'fa fa-cog fa-lg',
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
end
