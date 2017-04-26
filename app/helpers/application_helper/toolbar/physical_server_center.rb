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
            N_('Refresh relationships and power states for all items related to the selected items'),
            N_('Refresh Relationships and Power States'),
            :url_parms => "main_div",
            :confirm   => N_("Refresh relationships and power states for all items related to the selected items?"),
            :enabled   => false,
            :onwhen    => "1+"
          ),
          button(
            :physical_server_edit,
            'pficon pficon-edit fa-lg',
            t = N_('Edit Selected items'),
            t,
            :url_parms => "main_div",
            :enabled   => false,
            :onwhen    => "1+"
          ),
          button(
            :physical_server_delete,
            'pficon pficon-delete fa-lg',
            N_('Remove Selected items'),
            N_('Remove items'),
            :url_parms => "main_div",
            :confirm   => N_("Warning: The selected items and ALL of their components will be permanently removed!?"),
            :enabled   => false,
            :onwhen    => "1+"
          ),
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
        N_('Power Operations'),
        N_('Power'),
        :items => [
          button(
            :physical_server_power_on,
            nil,
            N_('Power on the server'),
            N_('Power On'),
            :image     => "power_on",
            :url_parms => "main_div",
            :confirm   => N_("Power on the server?"),
            :klass     => ApplicationHelper::Button::PhysicalServerFeatureButton,
            :options   => {:feature => :power_on}
          ),
          button(
            :physical_server_power_off,
            nil,
            N_('Power off the server'),
            N_('Power Off'),
            :image     => "power_off",
            :url_parms => "main_div",
            :confirm   => N_("Power off the server?"),
            :klass     => ApplicationHelper::Button::PhysicalServerFeatureButton,
            :options   => {:feature => :power_off}
          ),
          button(
            :physical_server_restart,
            nil,
            N_('Restart the server'),
            N_('Restart'),
            :image     => "power_reset",
            :url_parms => "main_div",
            :confirm   => N_("Restart the server?"),
            :klass     => ApplicationHelper::Button::PhysicalServerFeatureButton,
            :options   => {:feature => :restart}
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
            :image     => "blank_button",
            :url_parms => "main_div",
            :confirm   => N_("Blink the Identify LED?"),
            :klass     => ApplicationHelper::Button::PhysicalServerFeatureButton,
            :options   => {:feature => :blink_loc_led}
          ),
          button(
            :physical_server_turn_on_loc_led,
            nil,
            N_('Turn on the Idenfity LED'),
            N_('Turn On LED'),
            :image     => "blank_button",
            :url_parms => "main_div",
            :confirm   => N_("Turn on the Identify LED?"),
            :klass     => ApplicationHelper::Button::PhysicalServerFeatureButton,
            :options   => {:feature => :turn_on_loc_led}
          ),
          button(
            :physical_server_turn_off_loc_led,
            nil,
            N_('Turn off the Identify LED'),
            N_('Turn Off LED'),
            :image     => "blank_button",
            :url_parms => "main_div",
            :confirm   => N_("Turn off the Identify LED?"),
            :klass     => ApplicationHelper::Button::PhysicalServerFeatureButton,
            :options   => {:feature => :turn_off_loc_led}
          ),
        ]
      ),
    ]
  )
end