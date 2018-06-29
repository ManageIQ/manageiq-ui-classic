module ApplicationHelper::Toolbar::PhysicalInfrastructure::OperationsButtonGroupMixin
  extend ActiveSupport::Concern

  included do
    button_group(
      'physical_server_operations',
      [
        select(
          :physical_server_power_choice,
          'fa fa-power-off fa-lg',
          N_('Power Functions'),
          N_('Power'),
          :items => [
            api_button(
              :physical_server_power_on,
              nil,
              N_('Power on the server'),
              N_('Power On'),
              :icon    => "pficon pficon-on fa-lg",
              :api     => {
                :action => 'power_on',
                :entity => 'physical_servers'
              },
              :confirm => N_("Power on the server?"),
              :options => {:feature => :power_on}
            ),
            api_button(
              :physical_server_power_off,
              nil,
              N_('Power off the server'),
              N_('Power Off'),
              :icon    => "pficon pficon-off fa-lg",
              :api     => {
                :action => 'power_off',
                :entity => 'physical_servers'
              },
              :confirm => N_("Power off the server?"),
              :options => {:feature => :power_off}
            ),
            api_button(
              :physical_server_power_off_now,
              nil,
              N_('Power off the server immediately'),
              N_('Power Off Immediately'),
              :icon    => "pficon pficon-off fa-lg",
              :api     => {
                :action => 'power_off_now',
                :entity => 'physical_servers'
              },
              :confirm => N_("Power off the server immediately?"),
              :options => {:feature => :power_off_now}
            ),
            api_button(
              :physical_server_restart,
              nil,
              N_('Restart the server'),
              N_('Restart'),
              :icon    => "pficon pficon-restart fa-lg",
              :api     => {
                :action => 'restart',
                :entity => 'physical_servers'
              },
              :confirm => N_("Restart the server?"),
              :options => {:feature => :restart}
            ),
            api_button(
              :physical_server_restart_now,
              nil,
              N_('Restart Server Immediately'),
              N_('Restart Immediately'),
              :icon    => "pficon pficon-restart fa-lg",
              :api     => {
                :action => 'restart_now',
                :entity => 'physical_servers'
              },
              :confirm => N_("Restart the server immediately?"),
              :options => {:feature => :restart_now}
            ),
            api_button(
              :physical_server_restart_to_sys_setup,
              nil,
              N_('Restart Server to System Setup'),
              N_('Restart to System Setup'),
              :icon    => "pficon pficon-restart fa-lg",
              :api     => {
                :action => 'restart_to_sys_setup',
                :entity => 'physical_servers'
              },
              :confirm => N_("Restart the server to UEFI settings?"),
              :options => {:feature => :restart_to_sys_setup}
            ),
            api_button(
              :physical_server_restart_mgmt_controller,
              nil,
              N_('Restart Management Controller'),
              N_('Restart Management Controller'),
              :icon    => "pficon pficon-restart fa-lg",
              :api     => {
                :action => 'restart_mgmt_controller',
                :entity => 'physical_servers'
              },
              :confirm => N_("Restart management controller?"),
              :options => {:feature => :restart_mgmt_controller}
            )
          ]
        ),
        select(
          :physical_server_identify_choice,
          nil,
          N_('Identify LED Operations'),
          N_('Identify'),
          :items => [
            api_button(
              :physical_server_blink_loc_led,
              nil,
              N_('Blink the Identify LED'),
              N_('Blink LED'),
              :icon    => "pficon pficon-connected fa-lg",
              :api     => {
                :action => 'blink_loc_led',
                :entity => 'physical_servers'
              },
              :confirm => N_("Blink the Identify LED?"),
              :options => {:feature => :blink_loc_led}
            ),
            api_button(
              :physical_server_turn_on_loc_led,
              nil,
              N_('Turn on the Idenfity LED'),
              N_('Turn On LED'),
              :icon    => "pficon pficon-on fa-lg",
              :api     => {
                :action => 'turn_on_loc_led',
                :entity => 'physical_servers'
              },
              :confirm => N_("Turn on the Identify LED?"),
              :options => {:feature => :turn_on_loc_led}
            ),
            api_button(
              :physical_server_turn_off_loc_led,
              nil,
              N_('Turn off the Identify LED'),
              N_('Turn Off LED'),
              :icon    => "pficon pficon-off fa-lg",
              :api     => {
                :action => 'turn_off_loc_led',
                :entity => 'physical_servers'
              },
              :confirm => N_("Turn off the Identify LED?"),
              :options => {:feature => :turn_off_loc_led}
            ),
          ]
        )
      ]
    )
  end
end
