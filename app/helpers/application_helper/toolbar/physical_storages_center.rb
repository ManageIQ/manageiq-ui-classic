class ApplicationHelper::Toolbar::PhysicalStoragesCenter < ApplicationHelper::Toolbar::Basic
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
            N_('Refresh relationships and power states for all items related to these Physical Storages'),
            N_('Refresh Relationships and Power States'),
            :image   => "refresh",
            :data    => {'function'      => 'sendDataWithRx',
                         'function-data' => {:type => "refresh", :controller => "physicalStorageToolbarController"}},
            :confirm => N_("Refresh relationships and power states for all items related to these Physical Storages?"),
            :options => {:feature => :refresh}
          ),
          button(
            :physical_storage_new,
            'pficon pficon-add-circle-o fa-lg',
            t = N_('Attach a new storage system'),
            t,
            :url => "/new"
          ),
          api_button(
            :physical_storage_delete,
            nil,
            t = N_('Delete the Physical Storage'),
            t,
            :icon         => "pficon pficon-delete fa-lg",
            :klass        => ApplicationHelper::Button::PolymorphicConditionalButton,
            :options      => {:feature      => :delete,
                              :parent_class => "PhysicalStorage"},
            :api          => {
              :action => 'delete',
              :entity => 'physical_storages'
            },
            :confirm      => N_("Are you sure you want to delete this physical storage?\nNote that all of the attached services (e.g. volumes) will be unmapped."),
            :send_checked => true,
            :enabled      => false,
            :onwhen       => '1+'
          ),
        ]
      ),
    ]
  )
end
