class ApplicationHelper::Toolbar::PersistentVolumeCenter < ApplicationHelper::Toolbar::Basic
  button_group('persistent_volume_policy', [
    select(
      :persistent_volume_policy_choice,
      nil,
      t = N_('Policy'),
      t,
      :items => [
        button(
          :persistent_volume_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for this Persistent Volume'),
          N_('Edit Tags')
        ),
      ]
    ),
  ])
end
