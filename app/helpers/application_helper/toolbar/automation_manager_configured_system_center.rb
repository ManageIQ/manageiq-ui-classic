class ApplicationHelper::Toolbar::AutomationManagerConfiguredSystemCenter < ApplicationHelper::Toolbar::Basic
  button_group('configured_system_policy', [
                 select(
                   :automation_manager_configured_system_policy_choice,
                   nil,
                   t = N_('Policy'),
                   t,
                   :items => [
                     button(
                       :automation_manager_configured_system_tag,
                       'pficon pficon-edit fa-lg',
                       N_('Edit Tags for this Configured System'),
                       N_('Edit Tags')
                     ),
                   ]
                 ),
               ])
end
