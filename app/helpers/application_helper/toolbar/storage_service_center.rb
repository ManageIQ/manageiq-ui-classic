class ApplicationHelper::Toolbar::StorageServiceCenter < ApplicationHelper::Toolbar::Basic
  button_group(
    'storage_service_vmdb',
    [
      select(
        :storage_service_vmdb_choice,
        nil,
        t = N_('Configuration'),
        t,
        :items => [
          button(
            :storage_service_refresh,
            'fa fa-refresh fa-lg',
            N_('Refresh relationships and power states for all items related to this Storage Service'),
            N_('Refresh Relationships and Power States'),
            :image   => "refresh",
            :data    => {'function'      => 'sendDataWithRx',
                         'function-data' => {:type => "refresh", :controller => "storageServiceToolbarController"}},
            :confirm => N_("Refresh relationships and power states for all items related to this Storage Service?"),
            :options => {:feature => :refresh}
          ),
          button(
            :storage_service_edit,
            'pficon pficon-edit fa-lg',
            t = N_('Edit this Storage Service'),
            t,
            :url_parms    => 'main_div',
            :send_checked => true,
            :klass        => ApplicationHelper::Button::GenericFeatureButtonWithDisable,
            :options      => {:feature => :update}
          ),
          api_button(
            :storage_service_delete,
            nil,
            t = N_('Delete the Storage Service'),
            t,
            :icon         => "pficon pficon-delete fa-lg",
            :klass        => ApplicationHelper::Button::GenericFeatureButtonWithDisable,
            :options      => {:feature => :delete},
            :api          => {
              :action => 'delete',
              :entity => 'storage_services'
            },
            :confirm      => N_("Are you sure you want to delete this Storage Service?"),
            :send_checked => true
          ),
        ]
      ),
    ]
  )
end
