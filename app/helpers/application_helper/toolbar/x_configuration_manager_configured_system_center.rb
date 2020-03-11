class ApplicationHelper::Toolbar::XConfigurationManagerConfiguredSystemCenter < ApplicationHelper::Toolbar::Basic
  button_group('record_summary', [
    select(
      :configuration_manager_lifecycle_choice,
      nil,
      t = N_('Lifecycle'),
      t,
      :enabled => true,
      :items   => [
        button(
          :configuration_manager_configured_system_provision,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Provision Configured System'),
          t,
          :url          => "provision",
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => true),
      ]
    ),
    select(
      :configuration_manager_policy_choice,
      nil,
      t = N_('Policy'),
      t,
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
