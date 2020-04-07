class ApplicationHelper::Toolbar::ConfigurationManagerProvidersCenter < ApplicationHelper::Toolbar::Basic
  button_group('provider_vmdb', [
    select(
      :provider_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :enabled => true,
      :items   => [
        button(
          :provider_foreman_refresh_provider,
          'fa fa-refresh fa-lg',
          N_('Refresh relationships for all items related to the selected items'),
          N_('Refresh Relationships and Power states'),
          :url          => "refresh",
          :url_parms    => "main_div",
          :send_checked => true,
          :confirm      => N_("Refresh relationships for all items related to the selected items?"),
          :enabled      => false,
          :onwhen       => "1+"),
        separator,
        button(
          :provider_foreman_add_provider,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Add a new Provider'),
          t,
          :enabled => true,
          :url     => "new"),
        button(
          :provider_foreman_edit_provider,
          'pficon pficon-edit fa-lg',
          N_('Select a single item to edit'),
          N_('Edit Selected item'),
          :url          => "edit",
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1"),
        button(
          :provider_foreman_delete_provider,
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
                                         :tree_select    => 'root',
                                         :component_name => 'RemoveGenericItemModal'}}),
        separator,
      ]
    ),
  ])
  button_group('configuration_manager_policy', [
    select(
      :configuration_manager_policy_choice,
      nil,
      t = N_('Policy'),
      t,
      :enabled => false,
      :onwhen  => "1+",
      :items   => [
        button(
          :configuration_manager_provider_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for this Foreman Provider'),
          N_('Edit Tags'),
          :url_parms    => "main_div",
          :send_checked => true,
          :onwhen       => "1+")
      ]
    )
  ])
end
