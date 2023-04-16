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
            N_('Refresh the provider of this storage service'),
            N_('Refresh the provider'),
            :image        => "refresh",
            :confirm      => N_("Refresh the provider of this storage service?"),
            :options      => {:feature => :refresh},
            :api          => {
              :action => 'refresh',
              :entity => 'storage_services'
            },
            :send_checked => true
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
