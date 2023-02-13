class ApplicationHelper::Toolbar::StorageServicesCenter < ApplicationHelper::Toolbar::Basic
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
            N_('Refresh relationships and power states for all items related to these Storage Services'),
            N_('Refresh Relationships and Power States'),
            :image   => "refresh",
            :data    => {'function'      => 'sendDataWithRx',
                         'function-data' => {:type => "refresh", :controller => "storageServiceToolbarController"}},
            :confirm => N_("Refresh relationships and power states for all items related to these Storage Services?"),
            :options => {:feature => :refresh}
          ),
          button(
            :storage_service_new,
            'pficon pficon-add-circle-o fa-lg',
            t = N_('Create a new storage service'),
            t,
            :klass => ApplicationHelper::Button::StorageServiceNew
          ),
          api_button(
            :storage_service_delete,
            nil,
            t = N_('Delete the Storage Service'),
            t,
            :icon         => "pficon pficon-delete fa-lg",
            :klass        => ApplicationHelper::Button::PolymorphicConditionalButton,
            :options      => {:feature      => :delete,
                              :parent_class => "StorageService"},
            :api          => {
              :action => 'delete',
              :entity => 'storage_services'
            },
            :confirm      => N_("Are you sure you want to delete this Storage Service?"),
            :send_checked => true,
            :enabled      => false,
            :onwhen       => '1+'
          ),
        ]
      ),
    ]
  )
end
