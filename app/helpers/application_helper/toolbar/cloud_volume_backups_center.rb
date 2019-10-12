class ApplicationHelper::Toolbar::CloudVolumeBackupsCenter < ApplicationHelper::Toolbar::Basic
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
                       :enabled      => false,
                       :onwhen       => '1'
                     ),
                     separator,
                     button(
                       :cloud_volume_backup_delete,
                       'pficon pficon-delete fa-lg',
                       t = N_('Delete selected Backups'),
                       t,
                       :url_parms    => 'main_div',
                       :send_checked => true,
                       :confirm      => N_('Warning: The selected Cloud Volume Backups will be removed!'),
                       :enabled      => false,
                       :onwhen       => '1+'
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
      :enabled => false,
      :onwhen  => "1+",
      :items   => [
        button(
          :cloud_volume_backup_tag,
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
