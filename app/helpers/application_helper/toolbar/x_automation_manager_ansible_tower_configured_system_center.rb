class ApplicationHelper::Toolbar::XAutomationManagerAnsibleTowerConfiguredSystemCenter < ApplicationHelper::Toolbar::Basic
  button_group('record_summary', [
    select(
      :automation_manager_policy_choice,
      nil,
      N_('Policy'),
      :enabled => true,
      :items   => [
        button(
          :configured_system_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for this Configured System'),
          N_('Edit Tags'),
          :url          => "tagging",
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => true),
      ]
    ),
  ])
end
