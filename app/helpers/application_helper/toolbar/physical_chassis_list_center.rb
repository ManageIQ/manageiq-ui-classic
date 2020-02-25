class ApplicationHelper::Toolbar::PhysicalChassisListCenter < ApplicationHelper::Toolbar::Basic
  button_group(
    'physical_chassis_operations',
    [
      select(
        :physical_chassis_identify_choice,
        nil,
        N_('Identify LED Operations'),
        N_('Identify'),
        :items => [
          api_button(
            :physical_chassis_blink_loc_led,
            nil,
            N_('Blink the Identify LED'),
            N_('Blink LED'),
            :icon    => "pficon pficon-connected fa-lg",
            :api     => {
              :action => 'blink_loc_led',
              :entity => 'physical_chassis'
            },
            :enabled => false,
            :onwhen  => "1+",
            :confirm => N_("Blink the Identify LED?"),
            :options => {:feature => :blink_loc_led}
          ),
          api_button(
            :physical_chassis_turn_on_loc_led,
            nil,
            N_('Turn on the Idenfity LED'),
            N_('Turn On LED'),
            :icon    => "pficon pficon-on fa-lg",
            :api     => {
              :action => 'turn_on_loc_led',
              :entity => 'physical_chassis'
            },
            :enabled => false,
            :onwhen  => "1+",
            :confirm => N_("Turn on the Identify LED?"),
            :options => {:feature => :turn_on_loc_led}
          ),
          api_button(
            :physical_chassis_turn_off_loc_led,
            nil,
            N_('Turn off the Identify LED'),
            N_('Turn Off LED'),
            :icon    => "pficon pficon-off fa-lg",
            :api     => {
              :action => 'turn_off_loc_led',
              :entity => 'physical_chassis'
            },
            :enabled => false,
            :onwhen  => "1+",
            :confirm => N_("Turn off the Identify LED?"),
            :options => {:feature => :turn_off_loc_led}
          ),
        ]
      )
    ]
  )
end
