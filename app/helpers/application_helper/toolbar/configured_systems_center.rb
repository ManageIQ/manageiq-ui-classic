class ApplicationHelper::Toolbar::ConfiguredSystemsCenter < ApplicationHelper::Toolbar::Basic
  button_group('configuration_manager_lifecycle', [
    select(
      :configuration_manager_lifecycle_choice,
      nil,
      N_('Lifecycle'),
      :enabled => true,
      :items   => [
        button(
          :configured_system_provision,
          'pficon pficon-add-circle-o fa-lg',
          N_('Provision Configured Systems'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1+",
          :klass        => ApplicationHelper::Button::ConfiguredSystemProvision),
      ]
    ),
  ])
  button_group('configuration_manager_policy', [
    select(
      :configuration_manager_policy_choice,
      nil,
      N_('Policy'),
      :items => [
        button(
          :configured_system_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for this Configured System'),
          N_('Edit Tags'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1+"),
      ]
    ),
  ])
end
