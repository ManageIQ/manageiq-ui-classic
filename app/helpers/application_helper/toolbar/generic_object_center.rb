class ApplicationHelper::Toolbar::GenericObjectCenter < ApplicationHelper::Toolbar::Basic
  button_group('generic_object_policy', [
    select(
      :generic_object_policy_choice,
      nil,
      t = N_('Policy'),
      t,
      :items => [
        button(
          :generic_object_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for this Generic Object Instance'),
          N_('Edit Tags')),
      ]
    ),
  ])
end
