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
          api_button(
            :volume_mapping_delete,
            nil,
            t = N_('Delete volume mapping'),
            t,
            :icon         => "pficon pficon-delete fa-lg",
            :klass        => ApplicationHelper::Button::GenericFeatureButtonWithDisable,
            :options      => {:feature => :delete},
            :api          => {
              :action => 'delete',
              :entity => 'volume_mappings'
            },
            :confirm      => N_("Warning: The selected volume mappings will be permanently deleted!"),
            :send_checked => true
          ),
        ]
      ),
    ]
  )
end
