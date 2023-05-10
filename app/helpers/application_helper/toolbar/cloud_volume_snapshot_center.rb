class ApplicationHelper::Toolbar::CloudVolumeSnapshotCenter < ApplicationHelper::Toolbar::Basic
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
                       :klass        => ApplicationHelper::Button::GenericFeatureButtonWithDisable,
                       :options      => {:feature => :delete},
                       :api          => {
                         :action => 'delete',
                         :entity => 'cloud_volume_snapshots'
                       },
                       :confirm      => N_("Are you sure you want to delete this cloud volume snapshot?"),
                       :send_checked => true
                     ),
                   ]
                 ),
               ])
  button_group('cloud_volume_snapshot_policy', [
                 select(
                   :cloud_volume_snapshot_policy_choice,
                   nil,
                   t = N_('Policy'),
                   t,
                   :items => [
                     button(
                       :cloud_volume_snapshot_tag,
                       'pficon pficon-edit fa-lg',
                       N_('Edit tags for this Cloud Volume Snapshot'),
                       N_('Edit Tags')
                     ),
                   ]
                 ),
               ])
end
