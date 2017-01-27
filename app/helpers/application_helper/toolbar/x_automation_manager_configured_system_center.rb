class ApplicationHelper::Toolbar::XAutomationManagerConfiguredSystemCenter < ApplicationHelper::Toolbar::Basic
  button_group('record_summary', [
                                 select(
                                   :automation_manager_policy_choice,
                                   'fa fa-shield fa-lg',
                                   t = N_('Policy'),
                                   t,
                                   :enabled => true,
                                   :items   => [
                                     button(
                                       :automation_manager_configured_system_tag,
                                       'pficon pficon-edit fa-lg',
                                       N_('Edit Tags for this Configured System'),
                                       N_('Edit Tags'),
                                       :url       => "tagging",
                                       :url_parms => "main_div",
                                       :enabled   => true
                                     ),
                                   ]
                                 ),
                               ])
end
