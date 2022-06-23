class ApplicationHelper::Toolbar::VolumeMappingsCenter < ApplicationHelper::Toolbar::Basic
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
            N_('Refresh relationships and power states for all items related to these Volume Mappings'),
            N_('Refresh Relationships and Power States'),
            :image   => "refresh",
            :data    => {'function'      => 'sendDataWithRx',
                         'function-data' => {:type => "refresh", :controller => "volumeMappingToolbarController"}},
            :confirm => N_("Refresh relationships and power states for all items related to these Volume Mappings?"),
            :options => {:feature => :refresh}
          ),
          button(
            :volume_mapping_new,
            'pficon pficon-add-circle-o fa-lg',
            t = N_('Define a new volume mapping'),
            t,
            :klass => ApplicationHelper::Button::VolumeMappingNew
          ),
          api_button(
            :volume_mapping_delete,
            nil,
            t = N_('Delete selected volume mappings'),
            t,
            :icon         => "pficon pficon-delete fa-lg",
            :klass        => ApplicationHelper::Button::PolymorphicConditionalButton,
            :options      => {:feature      => :delete,
                              :parent_class => "VolumeMapping"},
            :api          => {
              :action => 'delete',
              :entity => 'volume_mappings'
            },
            :confirm      => N_("Warning: The selected volume mappings will be permanently deleted!"),
            :send_checked => true,
            :enabled      => false,
            :onwhen       => '1+'
          ),
        ]
      ),
    ]
  )
end
