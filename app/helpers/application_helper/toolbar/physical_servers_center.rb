class ApplicationHelper::Toolbar::PhysicalServersCenter < ApplicationHelper::Toolbar::Basic
  button_group(
    'physical_servers_operations',
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
            N_('Power on the selected servers'),
            N_('Power On'),
            :image     => "power_on",
            :url_parms => "main_div",
            :confirm   => N_("Power on the selected servers?"),
            :enabled   => false,
            :onwhen    => "1+",
            :klass     => ApplicationHelper::Button::PhysicalServerFeatureButton,
            :options   => {:feature => :power_on}
          ),
          button(
            :physical_server_power_off,
            nil,
            N_('Power off the selected servers'),
            N_('Power Off'),
            :image     => "power_off",
            :url_parms => "main_div",
            :confirm   => N_("Power off the selected servers?"),
            :enabled   => false,
            :onwhen    => "1+",
            :klass     => ApplicationHelper::Button::PhysicalServerFeatureButton,
            :options   => {:feature => :power_off}
          ),
          button(
            :physical_server_restart,
            nil,
            N_('Restart the selected servers'),
            N_('Restart'),
            :image     => "power_reset",
            :url_parms => "main_div",
            :confirm   => N_("Restart the selected servers?"),
            :enabled   => false,
            :onwhen    => "1+",
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
            :enabled   => false,
            :onwhen    => "1+",
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
            :enabled   => false,
            :onwhen    => "1+",
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
            :enabled   => false,
            :onwhen    => "1+",
            :klass     => ApplicationHelper::Button::PhysicalServerFeatureButton,
            :options   => {:feature => :turn_off_loc_led}
          ),
        ]
      ),
    ]
  )
end
