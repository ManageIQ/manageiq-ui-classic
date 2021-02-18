class ApplicationHelper::Toolbar::VolumeMappingCenter < ApplicationHelper::Toolbar::Basic
  button_group(
    'volume_mapping_vmdb',
    [
      select(
        :volume_mapping_vmdb_choice,
        nil,
        t = N_('Configuration'),
        t,
        :items => [
          button(
            :volume_mapping_refresh,
            'fa fa-refresh fa-lg',
            N_('Refresh relationships and power states for all items related to this Volume Mapping'),
            N_('Refresh Relationships and Power States'),
            :image   => "refresh",
            :data    => {'function'      => 'sendDataWithRx',
                         'function-data' => {:type => "refresh", :controller => "volumeMappingToolbarController"}},
            :confirm => N_("Refresh relationships and power states for all items related to this Volume Mapping?"),
            :options => {:feature => :refresh}
          ),
        ]
      ),
    ]
  )
end
