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
            N_('Refresh the selected Volume Mappings'),
            N_('Refresh the selected Volume Mappings'),
            :image        => "refresh",
            :confirm      => N_("Refresh the selected Volume Mappings?"),
            :send_checked => true,
            :enabled      => false,
            :onwhen       => '1+',
            :options      => {:feature => :refresh},
            :api          => {
              :action => 'refresh',
              :entity => 'volume_mappings'
            }
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
            t = N_('Delete selected Volume Mappings'),
            t,
            :icon         => "pficon pficon-delete fa-lg",
            :klass        => ApplicationHelper::Button::PolymorphicConditionalButton,
            :options      => {:feature      => :delete,
                              :parent_class => "VolumeMapping"},
            :api          => {
              :action => 'delete',
              :entity => 'volume_mappings'
            },
            :confirm      => N_("Are you sure you want to delete the selected Volume Mappings?"),
            :send_checked => true,
            :enabled      => false,
            :onwhen       => '1+'
          ),
        ]
      ),
    ]
  )
end
