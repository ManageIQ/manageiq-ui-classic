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
            N_('Refresh this Volume Mapping'),
            N_('Refresh this Volume Mapping'),
            :image        => "refresh",
            :confirm      => N_("Refresh this Volume Mapping?"),
            :options      => {:feature => :refresh},
            :api          => {
              :action => 'refresh',
              :entity => 'volume_mappings'
            },
            :send_checked => true
          ),
          api_button(
            :volume_mapping_delete,
            nil,
            t = N_('Delete this volume mapping'),
            t,
            :icon         => "pficon pficon-delete fa-lg",
            :klass        => ApplicationHelper::Button::GenericFeatureButtonWithDisable,
            :options      => {:feature => :delete},
            :api          => {
              :action => 'delete',
              :entity => 'volume_mappings'
            },
            :confirm      => N_("Are you sure you want to delete this Volume Mapping?"),
            :send_checked => true
          ),
        ]
      ),
    ]
  )
end
