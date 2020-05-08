class ApplicationHelper::Toolbar::EmsConfigurationCenter < ApplicationHelper::Toolbar::Basic
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
          N_('Refresh relationships for all items related to this Provider'),
          N_('Refresh Relationships and Power states'),
          :confirm => N_("Refresh relationships for all items related to this Provider?"),
          :klass   => ApplicationHelper::Button::EmsRefresh),
        separator,
        button(
          :ems_configuration_edit_provider,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this Provider'),
          t),
        button(
          :ems_configuration_delete_provider,
          'pficon pficon-delete fa-lg',
          t = N_('Remove this Provider from Inventory'),
          t,
          :data  => {'function'      => 'sendDataWithRx',
                     'function-data' => {:controller     => 'provider_dialogs',
                                         :modal_title    => N_('Delete Configuration Management Provider'),
                                         :modal_text     => N_('Are you sure you want to delete the following Configuration Management Provider?'),
                                         :api_url        => 'providers',
                                         :async_delete   => true,
                                         :redirect_url   => '/ems_configuration/show_list',
                                         :component_name => 'RemoveGenericItemModal'}})
      ]
    ),
  ])
  button_group('ems_configuration_policy', [
    select(
      :ems_configuration_policy_choice,
      nil,
      t = N_('Policy'),
      t,
      :items => [
        button(
          :ems_configuration_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for this Configuration Manager'),
          N_('Edit Tags')),
      ]
    ),
  ])
end
