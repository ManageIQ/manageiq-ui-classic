class ApplicationHelper::Toolbar::FirmwareRegistriesCenter < ApplicationHelper::Toolbar::Basic
  button_group(
    'firmware_registries_reloading',
    [
      button(
        :firmware_registries_reload,
        'fa fa-refresh fa-lg',
        N_('Refresh this page'),
        N_('Refresh'),
        # needs the function because reload can't be called with different this
        :data => { 'function' => 'function() { window.location.reload(); }' }
      ),
    ]
  )
  button_group(
    'firmware_registry_config',
    [
      select(
        :firmware_registry_config_choice,
        'fa fa-cog fa-lg',
        t = N_('Configuration'),
        t,
        :enabled => true,
        :items   => [
          api_button(
            :firmware_registry_sync,
            'fa fa-refresh fa-lg',
            t = N_('Refresh Relationships'),
            t,
            :klass   => ApplicationHelper::Button::ButtonWithoutRbacCheck,
            :api     => {:action => 'sync_fw_binaries', :entity => 'firmware_registries'},
            :enabled => false,
            :onwhen  => '1+'
          ),
          separator,
          button(
            :firmware_registry_add,
            'pficon pficon-add-circle-o fa-lg',
            t = N_('Add new Firmware Registry'),
            t,
            :klass => ApplicationHelper::Button::ButtonWithoutRbacCheck,
            :data  => {
              'function'      => 'sendDataWithRx',
              'function-data' => {
                :controller     => 'provider_dialogs',
                :modal_title    => N_('Add a new Firmware Registry'),
                :component_name => 'FirmwareRegistryForm',
              },
            }
          ),
          api_button(
            :firmware_registry_remove,
            'pficon pficon-delete fa-lg',
            t = N_('Remove Firmware Registries from Inventory'),
            t,
            :klass   => ApplicationHelper::Button::ButtonWithoutRbacCheck,
            :api     => {:action => 'delete', :entity => 'firmware_registries'},
            :confirm => N_('Remove selected Firmware Registries from Inventory?'),
            :enabled => false,
            :onwhen  => '1+'
          )
        ]
      ),
    ]
  )
end
