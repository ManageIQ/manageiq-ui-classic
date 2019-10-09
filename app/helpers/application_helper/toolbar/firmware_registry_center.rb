class ApplicationHelper::Toolbar::FirmwareRegistryCenter < ApplicationHelper::Toolbar::Basic
  button_group(
    'firmware_registry_reloading',
    [
      button(
        :firmware_registry_reload,
        'fa fa-refresh fa-lg',
        N_('Refresh this page'),
        N_('Refresh'),
        # needs the function because reload can't be called with different this
        :data => { 'function' => 'function() { window.location.reload(); }' }
      )
    ]
  )
  button_group(
    'firmware_registry_config',
    [
      select(
        :firmware_registry_config_choice,
        nil,
        t = N_('Configuration'),
        t,
        :enabled => true,
        :items   => [
          api_button(
            :firmware_registry_sync,
            'fa fa-refresh fa-lg',
            t = N_('Refresh Relationships'),
            t,
            :klass => ApplicationHelper::Button::ButtonWithoutRbacCheck,
            :api   => {:action => 'sync_fw_binaries', :entity => 'firmware_registries'}
          ),
          separator,
          button(
            :firmware_registry_remove,
            'pficon pficon-delete fa-lg',
            t = N_('Remove Firmware Registry from Inventory'),
            t,
            :klass   => ApplicationHelper::Button::ButtonWithoutRbacCheck,
            :data    => {
              'function'      => 'sendDataWithRx',
              'function-data' => {
                :controller => 'toolbarActions',
                :payload    => {:entity => 'firmware_registries'},
                :type       => 'delete'
              }.to_json
            },
            :confirm => N_('Remove this Firmware Registry from Inventory?')
          )
        ]
      ),
    ]
  )
end
