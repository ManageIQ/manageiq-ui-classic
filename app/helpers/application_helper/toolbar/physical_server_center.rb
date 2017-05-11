class ApplicationHelper::Toolbar::PhysicalServerCenter < ApplicationHelper::Toolbar::Basic
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
