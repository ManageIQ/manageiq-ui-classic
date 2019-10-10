class ApplicationHelper::Toolbar::PhysicalStorageCenter < ApplicationHelper::Toolbar::Basic
  button_group(
    'physical_storage_vmdb',
    [
      select(
        :physical_storage_vmdb_choice,
        'fa fa-cog fa-lg',
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
        ]
      ),
    ]
  )
end
