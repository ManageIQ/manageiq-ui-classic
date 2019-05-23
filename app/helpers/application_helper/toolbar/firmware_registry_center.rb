class ApplicationHelper::Toolbar::FirmwareRegistryCenter < ApplicationHelper::Toolbar::Basic
  button_group(
    'firmware_registry_reload',
    [
      button(
        :firmware_registry_reload,
        'fa fa-refresh fa-lg',
        N_('Refresh this page'),
        N_('Refresh'),
        :url_parms    => "main_div",
        :send_checked => true,
        :klass        => ApplicationHelper::Button::ButtonWithoutRbacCheck
      )
    ]
  )
end
