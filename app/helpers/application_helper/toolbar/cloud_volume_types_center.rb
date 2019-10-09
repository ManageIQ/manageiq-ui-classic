class ApplicationHelper::Toolbar::CloudVolumeTypesCenter < ApplicationHelper::Toolbar::Basic
  button_group('cloud_volume_type_policy', [
                 select(
                   :cloud_volume_type_policy_choice,
                   nil,
                   t = N_('Policy'),
                   t,
                   :enabled => false,
                   :onwhen  => "1+",
                   :items   => [
                     button(
                       :cloud_volume_type_tag,
                       'pficon pficon-edit fa-lg',
                       N_('Edit tags for the selected items'),
                       N_('Edit Tags'),
                       :url_parms    => "main_div",
                       :send_checked => true,
                       :enabled      => false,
                       :onwhen       => "1+"
                     ),
                   ]
                 ),
               ])
end
