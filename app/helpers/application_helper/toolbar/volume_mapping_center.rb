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
            N_('Refresh the provider of this volume mapping'),
            N_('Refresh the provider'),
            :image        => "refresh",
            :confirm      => N_("Refresh the provider of this volume mapping?"),
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
