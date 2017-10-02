class ApplicationHelper::Toolbar::PhysicalServerCenter < ApplicationHelper::Toolbar::Basic
  button_group(
    'physical_server_vmdb',
    [
      select(
        :physical_server_vmdb_choice,
        'fa fa-cog fa-lg',
        t = N_('Configuration'),
        t,
        :items => [
          button(
            :physical_server_refresh,
            'fa fa-refresh fa-lg',
            N_('Refresh relationships and power states for all items related to the selected Physical Servers'),
            N_('Refresh Relationships and Power States'),
            :url_parms => "main_div",
            :confirm   => N_("Refresh relationships and power states for all items related to the selected Physical Servers?"),
          ),
          button(
            :physical_server_delete,
            'pficon pficon-delete fa-lg',
            N_('Remove selected Physical Servers from Inventory'),
            N_('Remove Physical Servers from Inventory'),
            :url_parms => "main_div",
            :confirm   => N_("Warning: The selected Physical Servers and ALL of their components will be permanently removed!"),
          )
        ]
      ),
    ]
  )
  button_group(
    'physical_server_operations',
    [
      select(
        :physical_server_power_choice,
        'fa fa-power-off fa-lg',
        N_('Power Functions'),
        N_('Power'),
        :items => [
          button(
            :physical_server_power_on,
            nil,
            N_('Power on the server'),
            N_('Power On'),
            :image   => "power_on",
            :data    => {'function'      => 'sendDataWithRx',
                         'function-data' => '{"type": "power_on", "controller": "physicalServerToolbarController"}'},
            :confirm => N_("Power on the server?"),
            :options => {:feature => :power_on}
          ),
          button(
            :physical_server_power_off,
            nil,
            N_('Power off the server'),
            N_('Power Off'),
            :image   => "power_off",
            :data    => {'function'      => 'sendDataWithRx',
                         'function-data' => '{"type": "power_off", "controller": "physicalServerToolbarController"}'},
            :confirm => N_("Power off the server?"),
            :options => {:feature => :power_off}
          ),
          button(
            :physical_server_restart,
            nil,
            N_('Restart the server'),
            N_('Restart'),
            :image   => "power_reset",
            :data    => {'function'      => 'sendDataWithRx',
                         'function-data' => '{"type": "restart", "controller": "physicalServerToolbarController"}'},
            :confirm => N_("Restart the server?"),
            :options => {:feature => :restart}
          ),
        ]
      ),
      select(
        :physical_server_identify_choice,
        nil,
        N_('Identify LED Operations'),
        N_('Identify'),
        :items => [
          button(
            :physical_server_blink_loc_led,
            nil,
            N_('Blink the Identify LED'),
            N_('Blink LED'),
            :image   => "blank_button",
            :data    => {'function'      => 'sendDataWithRx',
                         'function-data' => '{"type": "blink_loc_led", "controller": "physicalServerToolbarController"}'},
            :confirm => N_("Blink the Identify LED?"),
            :options => {:feature => :blink_loc_led}
          ),
          button(
            :physical_server_turn_on_loc_led,
            nil,
            N_('Turn on the Idenfity LED'),
            N_('Turn On LED'),
            :image   => "blank_button",
            :data    => {'function'      => 'sendDataWithRx',
                         'function-data' => '{"type": "turn_on_loc_led", "controller": "physicalServerToolbarController"}'},
            :confirm => N_("Turn on the Identify LED?"),
            :options => {:feature => :turn_on_loc_led}
          ),
          button(
            :physical_server_turn_off_loc_led,
            nil,
            N_('Turn off the Identify LED'),
            N_('Turn Off LED'),
            :image   => "blank_button",
            :data    => {'function'      => 'sendDataWithRx',
                         'function-data' => '{"type": "turn_off_loc_led", "controller": "physicalServerToolbarController"}'},
            :confirm => N_("Turn off the Identify LED?"),
            :options => {:feature => :turn_off_loc_led}
          ),
        ]
      ),
    ]
  )
end
