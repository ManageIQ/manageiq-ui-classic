class ApplicationHelper::Toolbar::ConfiguredSystemCenter < ApplicationHelper::Toolbar::Basic
  button_group('configured_system_policy', [
    select(
      :configured_system_policy_choice,
      nil,
      t = N_('Policy'),
      t,
      :items => [
        button(
          :configured_system_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for this Configured System'),
          N_('Edit Tags')),
      ]
    ),
  ])
  button_group('access', [
    select(
      :access_choice,
      nil,
      N_('Access'),
      N_('Access'),
      :items => [
        button(
          :configured_system_console,
          'pficon pficon-screen fa-lg',
          N_('Open the Configured System console'),
          N_('Configured System console'),
          :url   => "launch_configured_system_console",
          :klass => ApplicationHelper::Button::ConfiguredSystemConsole
        ),
      ]
    ),
  ])
end
