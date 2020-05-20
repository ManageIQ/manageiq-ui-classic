class ApplicationHelper::Toolbar::EmsConfigurationsCenter < ApplicationHelper::Toolbar::Basic
  button_group('ems_configuration_vmdb', [
    select(
      :ems_configuration_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :enabled => true,
      :items   => [
        button(
          :ems_configuration_refresh_provider,
          'fa fa-refresh fa-lg',
          N_('Refresh relationships for all items related to the selected items'),
          N_('Refresh Relationships and Power states'),
          :url_parms    => "main_div",
          :send_checked => true,
          :confirm      => N_("Refresh relationships for all items related to the selected items?"),
          :enabled      => false,
          :onwhen       => "1+"),
        separator,
        button(
          :ems_configuration_add_provider,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Add a new Provider'),
          t,
          :enabled => true),
        button(
          :ems_configuration_edit_provider,
          'pficon pficon-edit fa-lg',
          N_('Select a single item to edit'),
          N_('Edit Selected item'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1"),
        button(
          :ems_configuration_delete_provider,
          'pficon pficon-delete fa-lg',
          t = N_('Remove selected items from Inventory'),
          t,
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1+",
          :data  => {'function'      => 'sendDataWithRx',
                     'function-data' => {:controller     => 'provider_dialogs',
                                         :modal_title    => N_('Delete Configuration Management Providers'),
                                         :modal_text     => N_('Are you sure you want to delete the following Configuration Management Providers?'),
                                         :api_url        => 'providers',
                                         :async_delete   => true,
                                         :redirect_url   => '/ems_configuration/show_list',
                                         :component_name => 'RemoveGenericItemModal'}}),
        separator,
      ]
    ),
  ])
  button_group('ems_configuration_policy', [
    select(
      :ems_configuration_policy_choice,
      nil,
      t = N_('Policy'),
      t,
      :enabled => false,
      :onwhen  => "1+",
      :items   => [
        button(
          :ems_configuration_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for this Configuration Manager Provider'),
          N_('Edit Tags'),
          :url_parms    => "main_div",
          :send_checked => true,
          :onwhen       => "1+")
      ]
    )
  ])
end
