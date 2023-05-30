class ApplicationHelper::Toolbar::PhysicalStorageCenter < ApplicationHelper::Toolbar::Basic
  button_group(
    'physical_storage_vmdb',
    [
      select(
        :physical_storage_vmdb_choice,
        nil,
        t = N_('Configuration'),
        t,
        :items => [
          button(
            :physical_storage_refresh,
            'fa fa-refresh fa-lg',
            N_('Refresh this Physical Storage'),
            N_('Refresh this Physical Storage'),
            :image        => "refresh",
            :confirm      => N_("Refresh this Physical Storage?"),
            :options      => {:feature => :refresh},
            :api          => {
              :action => 'refresh',
              :entity => 'physical_storages'
            },
            :send_checked => true
          ),
          button(
            :physical_storage_edit,
            'pficon pficon-edit fa-lg',
            t = N_('Edit this Physical Storage'),
            t,
            :url_parms    => 'main_div',
            :send_checked => true
          ),
          api_button(
            :physical_storage_delete,
            nil,
            t = N_('Delete this Physical Storage'),
            t,
            :icon         => "pficon pficon-delete fa-lg",
            :klass        => ApplicationHelper::Button::GenericFeatureButtonWithDisable,
            :options      => {:feature => :delete},
            :api          => {
              :action => 'delete',
              :entity => 'physical_storages'
            },
            :confirm      => N_("Are you sure you want to delete this Physical Storage?\nNote that all of the attached services (e.g. volumes) will be unmapped."),
            :send_checked => true
          ),
        ]
      ),
    ]
  )
  button_group(
    'physical_storage_monitoring',
    [
      select(
        :physical_storage_monitoring_choice,
        nil,
        t = N_('Monitoring'),
        t,
        :items => [
          button(
            :physical_storage_timeline,
            'ff ff-timeline fa-lg',
            N_('Show Timelines for this Physical Storage Provider'),
            N_('Timelines'),
            :klass     => ApplicationHelper::Button::EmsTimeline,
            :url_parms => "?display=timeline"
          ),
        ]
      ),
    ]
  )
end
