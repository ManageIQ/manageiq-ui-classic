class ApplicationHelper::Toolbar::ConfigurationManagerProviderCenter < ApplicationHelper::Toolbar::Basic
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
          N_('Refresh relationships for all items related to this Provider'),
          N_('Refresh Relationships and Power states'),
          :url     => "refresh",
          :confirm => N_("Refresh relationships for all items related to this Provider?"),
          :klass   => ApplicationHelper::Button::EmsRefresh),
        separator,
        button(
          :provider_foreman_edit_provider,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this Provider'),
          t,
          :url => "edit"),
        button(
          :provider_foreman_delete_provider,
          'pficon pficon-delete fa-lg',
          t = N_('Remove this Provider from Inventory'),
          t,
          :data  => {'function'      => 'sendDataWithRx',
                     'function-data' => {:controller     => 'provider_dialogs',
                                         :modal_title    => N_('Delete Configuration Management Provider'),
                                         :modal_text     => N_('Are you sure you want to delete the following Configuration Management Provider?'),
                                         :api_url        => 'providers',
                                         :async_delete   => true,
                                         :tree_select    => 'root',
                                         :component_name => 'RemoveGenericItemModal'}})
      ]
    ),
  ])
end
