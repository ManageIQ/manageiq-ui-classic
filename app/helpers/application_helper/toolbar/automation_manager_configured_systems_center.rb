class ApplicationHelper::Toolbar::AutomationManagerConfiguredSystemsCenter < ApplicationHelper::Toolbar::Basic
  button_group('automation_manager_configuration_manager_policy', [
                 select(
                   :automation_manager_configuration_manager_policy_choice,
                   nil,
                   N_('Policy'),
                   :items => [
                     button(
                       :automation_manager_configured_system_tag,
                       'pficon pficon-edit fa-lg',
                       N_('Edit Tags for this Configured System'),
                       N_('Edit Tags'),
                       :url_parms    => "main_div",
                       :send_checked => true,
                       :enabled      => false,
                       :onwhen       => "1+"
                     ),
                   ]
                 ),
               ])
end
