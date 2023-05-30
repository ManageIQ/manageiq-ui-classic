class ApplicationHelper::Toolbar::CloudVolumeCenter < ApplicationHelper::Toolbar::Basic
  button_group('cloud_volume_vmdb', [
                 select(
                   :cloud_volume_vmdb_choice,
                   nil,
                   t = N_('Configuration'),
                   t,
                   :items => [
                     button(
                       :cloud_volume_backup_create,
                       'pficon pficon-volume fa-lg',
                       t = N_('Create a Backup of this Cloud Volume'),
                       t,
                       :klass        => ApplicationHelper::Button::GenericFeatureButtonWithDisable,
                       :options      => {:feature => :backup_create},
                       :url_parms    => 'main_div',
                       :send_checked => true,
                     ),
                     button(
                       :cloud_volume_backup_restore,
                       'pficon pficon-volume fa-lg',
                       t = N_('Restore from a Backup of this Cloud Volume'),
                       t,
                       :klass        => ApplicationHelper::Button::GenericFeatureButtonWithDisable,
                       :options      => {:feature => :backup_restore},
                       :url_parms    => 'main_div',
                       :send_checked => true,
                     ),
                     button(
                       :cloud_volume_snapshot_create,
                       'pficon pficon-volume fa-lg',
                       t = N_('Create a Snapshot of this Cloud Volume'),
                       t,
                       :klass        => ApplicationHelper::Button::GenericFeatureButtonWithDisable,
                       :options      => {:feature => :snapshot_create},
                       :url_parms    => 'main_div',
                       :send_checked => true,
                     ),
                     button(
                       :cloud_volume_attach,
                       'pficon pficon-volume fa-lg',
                       t = N_('Attach this Cloud Volume to an Instance'),
                       t,
                       :klass        => ApplicationHelper::Button::VolumeAttach,
                       :options      => {:feature => :attach_volume},
                       :url_parms    => 'main_div',
                       :send_checked => true,
                     ),
                     button(
                       :cloud_volume_detach,
                       'pficon pficon-volume fa-lg',
                       t = N_('Detach this Cloud Volume from an Instance'),
                       t,
                       :klass        => ApplicationHelper::Button::VolumeDetach,
                       :url_parms    => 'main_div',
                       :send_checked => true,
                     ),

                     button(
                       :cloud_volume_clone,
                       'pficon pficon-volume fa-lg',
                       t = N_('Clone this Cloud Volume'),
                       t,
                       :klass        => ApplicationHelper::Button::VolumeClone,
                       :options      => {:feature => :clone_volume},
                       :url_parms    => 'main_div',
                       :send_checked => true
                     ),

                     button(
                       :cloud_volume_edit,
                       'pficon pficon-edit fa-lg',
                       t = N_('Edit this Cloud Volume'),
                       t,
                       :url_parms    => 'main_div',
                       :send_checked => true,
                       :klass     => ApplicationHelper::Button::GenericFeatureButtonWithDisable,
                       :options   => {:feature => :update},
                     ),
                     button(
                       :cloud_volume_delete,
                       'pficon pficon-delete fa-lg',
                       t = N_('Delete this Cloud Volume'),
                       t,
                       :url_parms => 'main_div',
                       :klass     => ApplicationHelper::Button::GenericFeatureButtonWithDisable,
                       :options   => {:feature => :delete},
                       :data      => {'function'      => 'sendDataWithRx',
                                      'function-data' => {:controller      => 'provider_dialogs',
                                                          :modal_title     => N_('Delete Volume'),
                                                          :modal_text      => N_('Are you sure you want to delete this volume?'),
                                                          :api_url         => 'cloud_volumes',
                                                          :async_delete    => false,
                                                          :ajax_reload     => true,
                                                          :redirect_url    => '/cloud_volume/show_list',
                                                          :try_safe_delete => true,
                                                          :component_name  => 'RemoveGenericItemModal'}}
                     ),
                     button(
                       :cloud_volume_refresh,
                       'fa fa-refresh fa-lg',
                       N_('Refresh this Cloud Volume'),
                       N_('Refresh this Cloud Volume'),
                       :image        => "refresh",
                       :confirm      => N_("Refresh this Cloud Volume?"),
                       :options      => {:feature => :refresh},
                       :api          => {
                         :action => 'refresh',
                         :entity => 'cloud_volumes'
                       },
                       :send_checked => true
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
      :items => [
        button(
          :cloud_volume_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit tags for this Cloud Volume'),
          N_('Edit Tags')),
      ]
    ),
  ])
end
