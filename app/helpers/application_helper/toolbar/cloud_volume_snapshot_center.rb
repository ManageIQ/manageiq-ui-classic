class ApplicationHelper::Toolbar::CloudVolumeSnapshotCenter < ApplicationHelper::Toolbar::Basic
  button_group('cloud_volume_snapshot_vmdb', [
                 select(
                   :cloud_volume_snapshot_vmdb_choice,
                   nil,
                   t = N_('Configuration'),
                   t,
                   :items => [
                     button(
                       :cloud_volume_snapshot_delete,
                       'pficon pficon-delete fa-lg',
                       t = N_('Delete Cloud Volume Snapshot'),
                       t
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
