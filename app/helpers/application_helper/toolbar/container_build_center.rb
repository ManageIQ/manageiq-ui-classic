class ApplicationHelper::Toolbar::ContainerBuildCenter < ApplicationHelper::Toolbar::Basic
  button_group('container_build_policy', [
    select(
      :container_build_policy_choice,
      nil,
      t = N_('Policy'),
      t,
      :items => [
        button(
          :container_build_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for this Container Build'),
          N_('Edit Tags')),
      ]
    ),
  ])
end
