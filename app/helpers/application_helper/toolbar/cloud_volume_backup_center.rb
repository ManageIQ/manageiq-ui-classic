class ApplicationHelper::Toolbar::CloudVolumeBackupCenter < ApplicationHelper::Toolbar::Basic
  button_group('cloud_volume_backup', [
                 select(
                   :cloud_volume_backup_choice,
                   nil,
                   t = N_('Configuration'),
                   t,
                   :items => [
                     button(
                       :cloud_volume_backup_restore_to_volume,
                       'pficon pficon-volume fa-lg',
                       t = N_('Restore backup to Cloud Volume'),
                       t,
                       :url_parms    => 'main_div',
                       :send_checked => true,
                     ),
                   ]
                 )
               ])
  button_group('cloud_volume_backup_policy', [
    select(
      :cloud_volume_backup_policy_choice,
      nil,
      t = N_('Policy'),
      t,
      :items => [
        button(
          :cloud_volume_backup_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit tags for this Cloud Volume Backup'),
          N_('Edit Tags')),
      ]
    ),
  ])
end
