class ApplicationHelper::Toolbar::ConfigurationProfileCenter < ApplicationHelper::Toolbar::Basic
  button_group('access', [
    select(
      :access_choice,
      nil,
      N_('Access'),
      N_('Access'),
      :items => [
        button(
          :configuration_profile_console,
          'pficon pficon-screen fa-lg',
          N_('Open the Configuration Profile console'),
          N_('Configuration Profile console'),
          :url   => "launch_configuration_profile_console",
          :klass => ApplicationHelper::Button::ConfigurationProfileConsole
        ),
      ]
    ),
  ])
end
