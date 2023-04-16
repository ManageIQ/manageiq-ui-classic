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
            N_('Refresh the provider of the selected storage service(s)'),
            N_('Refresh the provider'),
            :image        => "refresh",
            :confirm      => N_("Refresh the provider of the selected storage service(s)?"),
            :send_checked => true,
            :enabled      => false,
            :onwhen       => '1+',
            :options      => {:feature => :refresh},
            :api          => {
              :action => 'refresh',
              :entity => 'storage_services'
            }
          ),
          button(
            :storage_service_new,
            'pficon pficon-add-circle-o fa-lg',
            t = N_('Create a new storage service'),
            t,
            :klass => ApplicationHelper::Button::StorageServiceNew
          ),
          button(
            :storage_service_edit,
            'pficon pficon-edit fa-lg',
            t = N_('Edit selected Storage Service'),
            t,
            :url_parms    => 'main_div',
            :send_checked => true,
            :enabled      => false,
            :klass        => ApplicationHelper::Button::PolymorphicConditionalButton,
            :options      => {:feature      => :update,
                              :parent_class => "StorageService"},
            :onwhen       => '1'
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
