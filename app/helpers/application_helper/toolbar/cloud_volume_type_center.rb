class ApplicationHelper::Toolbar::CloudVolumeTypeCenter < ApplicationHelper::Toolbar::Basic
  button_group('cloud_volume_type_policy', [
                 select(
                   :cloud_volume_type_policy_choice,
                   nil,
                   t = N_('Policy'),
                   t,
                   :items => [
                     button(
                       :cloud_volume_type_tag,
                       'pficon pficon-edit fa-lg',
                       N_('Edit tags for this Cloud Volume Type'),
                       N_('Edit Tags')
                     ),
                   ]
                 ),
               ])
end
