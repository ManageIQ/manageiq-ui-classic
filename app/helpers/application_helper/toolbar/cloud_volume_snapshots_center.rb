class ApplicationHelper::Toolbar::CloudVolumeSnapshotsCenter < ApplicationHelper::Toolbar::Basic
  button_group('cloud_volume_snapshot_vmdb', [
     select(
       :cloud_volume_snapshot_vmdb_choice,
       nil,
       t = N_('Configuration'),
       t,
       :items => [
         api_button(
           :cloud_volume_snapshot_delete,
           nil,
           t = N_('Delete the Cloud Volume Snapshot'),
           t,
           :icon         => "pficon pficon-delete fa-lg",
           :klass        => ApplicationHelper::Button::PolymorphicConditionalButton,
           :options      => {:feature      => :delete,
                             :parent_class => "CloudVolumeSnapshot"},
           :api          => {
             :action => 'delete',
             :entity => 'cloud_volume_snapshots'
           },
           :confirm      => N_("Are you sure you want to delete this cloud volume snapshot?"),
           :send_checked => true,
           :enabled      => false,
           :onwhen       => '1+'
         ),
       ]
     )
   ])
  button_group('cloud_volume_snapshot_policy', [
    select(
      :cloud_volume_snapshot_policy_choice,
      nil,
      t = N_('Policy'),
      t,
      :enabled => false,
      :onwhen  => "1+",
      :items   => [
        button(
          :cloud_volume_snapshot_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit tags for the selected items'),
          N_('Edit Tags'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1+"),
      ]
    ),
  ])
end
