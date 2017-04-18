class ApplicationHelper::Toolbar::AnsibleRepositoriesCenter < ApplicationHelper::Toolbar::Basic
  button_group('ansible_repositories', [
    select(
      :ansible_repositories_configuration,
      'fa fa-cog fa-lg',
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :embedded_configuration_script_source_refresh,
          'fa fa-refresh fa-lg',
          N_('Refresh Embedded Ansible Provider'),
          N_('Refresh Embedded Ansible Provider'),
          :klass => ApplicationHelper::Button::EmbeddedAnsible,
          :url       => "repository_refresh",
          :url_parms => "main_div",
          :confirm   => N_("Refresh relationships for all items from Embedded Ansible Provider?"),
          :enabled   => true),
        separator,
        button(
          :embedded_configuration_script_source_add,
          'pficon pficon-edit fa-lg',
          t = N_('Add New Repository'),
          t,
          :klass => ApplicationHelper::Button::EmbeddedAnsible,
          :url_parms => "unused_div"),
        button(
          :embedded_configuration_script_source_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this Repository'),
          t,
          :klass => ApplicationHelper::Button::EmbeddedAnsible,
          :enabled   => false,
          :onwhen    => "1",
          :url_parms => "unused_div"),
        button(
          :embedded_configuration_script_source_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Remove selected Repositories'),
          t,
          :klass => ApplicationHelper::Button::EmbeddedAnsible,
          :url_parms => "unused_div",
          :enabled   => false,
          :onwhen    => "1+",
          :confirm   => N_("Warning: The selected Repository will be permanently removed!")),
      ]
    )
  ])
end
