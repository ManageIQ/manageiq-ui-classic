class ApplicationHelper::Toolbar::CloudVolumesCenter < ApplicationHelper::Toolbar::Basic
  button_group('cloud_volume_vmdb', [
                 select(
                   :cloud_volume_vmdb_choice,
                   nil,
                   t = N_('Configuration'),
                   t,
                   :items => [
                     button(
                       :cloud_volume_new,
                       'pficon pficon-add-circle-o fa-lg',
                       t = N_('Add a new Cloud Volume'),
                       t,
                       :klass => ApplicationHelper::Button::CloudVolumeNew
                     ),
                     separator,
                     button(
                       :cloud_volume_backup_create,
                       'pficon pficon-volume fa-lg',
                       t = N_('Create a Backup of selected Cloud Volume'),
                       t,
                       :klass        => ApplicationHelper::Button::PolymorphicConditionalButton,
                       :options      => {:feature      => :backup_create,
                                         :parent_class => "CloudVolume"},
                       :url_parms    => 'main_div',
                       :send_checked => true,
                       :enabled      => false,
                       :onwhen       => '1'
                     ),
                     button(
                       :cloud_volume_backup_restore,
                       'pficon pficon-volume fa-lg',
                       t = N_('Restore from a Backup of selected Cloud Volume'),
                       t,
                       :klass        => ApplicationHelper::Button::PolymorphicConditionalButton,
                       :options      => {:feature      => :backup_restore,
                                         :parent_class => "CloudVolume"},
                       :url_parms    => 'main_div',
                       :send_checked => true,
                       :enabled      => false,
                       :onwhen       => '1'
                     ),
                     button(
                       :cloud_volume_snapshot_create,
                       'pficon pficon-volume fa-lg',
                       t = N_('Create a Snapshot of selected Cloud Volume'),
                       t,
                       :url_parms    => 'main_div',
                       :send_checked => true,
                       :enabled      => false,
                       :onwhen       => '1'
                     ),
                     button(
                       :cloud_volume_attach,
                       'pficon pficon-volume fa-lg',
                       t = N_('Attach selected Cloud Volume to an Instance'),
                       t,
                       :url_parms    => 'main_div',
                       :send_checked => true,
                       :enabled      => false,
                       :onwhen       => '1'
                     ),
                     button(
                       :cloud_volume_detach,
                       'pficon pficon-volume fa-lg',
                       t = N_('Detach selected Cloud Volume from an Instance'),
                       t,
                       :url_parms    => 'main_div',
                       :send_checked => true,
                       :enabled      => false,
                       :onwhen       => '1'
                     ),
                     button(
                       :cloud_volume_edit,
                       'pficon pficon-edit fa-lg',
                       t = N_('Edit selected Cloud Volume'),
                       t,
                       :url_parms    => 'main_div',
                       :send_checked => true,
                       :enabled      => false,
                       :onwhen       => '1'
                     ),
                     button(
                       :cloud_volume_delete,
                       'pficon pficon-delete fa-lg',
                       t = N_('Delete selected Cloud Volumes'),
                       t,
                       :url_parms    => 'main_div',
                       :send_checked => true,
                       :confirm      => N_('Warning: The selected Cloud Volume and ALL of their components will be removed!'),
                       :enabled      => false,
                       :onwhen       => '1+'
                     ),
                   ]
                 )
               ])
  button_group('cloud_volume_policy', [
    select(
      :cloud_volume_policy_choice,
      nil,
      t = N_('Policy'),
      t,
      :enabled => "false",
      :onwhen  => "1+",
      :items   => [
        button(
          :cloud_volume_tag,
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
