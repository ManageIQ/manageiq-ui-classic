class ApplicationHelper::Toolbar::PersistentVolumesCenter < ApplicationHelper::Toolbar::Basic
  button_group('persistent_volume_policy', [
    select(
      :persistent_volume_policy_choice,
      'fa fa-shield fa-lg',
      t = N_('Policy'),
      t,
      :enabled => false,
      :onwhen  => "1+",
      :items   => [
        button(
          :persistent_volume_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for these Persistent Volumes'),
          N_('Edit Tags'),
          :url_parms => "main_div",
          :enabled   => false,
          :onwhen    => "1+"),
      ]
    ),
  ])
end
