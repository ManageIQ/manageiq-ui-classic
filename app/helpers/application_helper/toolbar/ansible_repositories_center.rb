class ApplicationHelper::Toolbar::AnsibleRepositoriesCenter < ApplicationHelper::Toolbar::Basic
  button_group('ansible_repositories', [
    select(
      :ansible_repositories_configuration,
      'fa fa-cog fa-lg',
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :embedded_configuration_script_source_add,
          'pficon pficon-edit fa-lg',
          t = N_('Add New Repository'),
          t,
          :url => "/new"),
        button(
          :embedded_configuration_script_source_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this Repository'),
          t,
          :onwhen => "1",
          :url => "/edit"),
        button(
          :embedded_configuration_script_source_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Remove selected Repositories'),
          t,
          :url_parms => "&refresh=y",
          :onwhen => "+1",
          :confirm   => N_("Warning: The selected Repository will be permanently removed!")),
      ]
    )
  ])
end
