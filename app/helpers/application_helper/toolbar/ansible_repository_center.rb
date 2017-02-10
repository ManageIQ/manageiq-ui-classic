class ApplicationHelper::Toolbar::AnsibleRepositoryCenter < ApplicationHelper::Toolbar::Basic
  button_group('ansible_repository', [
    select(
      :ansible_repository_configuration,
      'fa fa-cog fa-lg',
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :embedded_configuration_script_source_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this Repository'),
          t,
          :url => "/edit"),
        button(
          :embedded_configuration_script_source_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Remove this Repository'),
          t,
          :url_parms => "&refresh=y",
          :confirm   => N_("Warning: The selected Repository will be permanently removed!")),
      ]
    ),
  ])
end
