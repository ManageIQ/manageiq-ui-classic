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
            N_('Refresh relationships and power states for all items related to this Physical Storage'),
            N_('Refresh Relationships and Power States'),
            :image   => "refresh",
            :data    => {'function'      => 'sendDataWithRx',
                         'function-data' => {:type => "refresh", :controller => "physicalStorageToolbarController"}},
            :confirm => N_("Refresh relationships and power states for all items related to this Physical Storage?"),
            :options => {:feature => :refresh}
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
            t = N_('Delete the Physical Storage'),
            t,
            :icon         => "pficon pficon-delete fa-lg",
            :klass        => ApplicationHelper::Button::GenericFeatureButtonWithDisable,
            :options      => {:feature => :delete},
            :api          => {
              :action => 'delete',
              :entity => 'physical_storages'
            },
            :confirm      => N_("Are you sure you want to delete this physical storage?\nNote that all of the attached services (e.g. volumes) will be unmapped."),
            :send_checked => true
          ),
        ]
      ),
    ]
  )
end
