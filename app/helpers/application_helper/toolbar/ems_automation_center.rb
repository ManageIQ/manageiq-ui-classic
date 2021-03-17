class ApplicationHelper::Toolbar::EmsAutomationCenter < ApplicationHelper::Toolbar::Basic
  button_group('ems_automation_vmdb', [
    select(
      :ems_automation_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :enabled => true,
      :items   => [
        button(
          :ems_automation_refresh_provider,
          'fa fa-refresh fa-lg',
          N_('Refresh relationships for all items related to this Provider'),
          N_('Refresh Relationships and Power states'),
          :confirm => N_("Refresh relationships for all items related to this Provider?"),
          :klass   => ApplicationHelper::Button::EmsRefresh
        ),
        separator,
        button(
          :ems_automation_edit_provider,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this Provider'),
          t,
          :url => "/edit"
        ),
        button(
          :ems_automation_delete_provider,
          'pficon pficon-delete fa-lg',
          t = N_('Remove this Provider from Inventory'),
          t,
          :data  => {'function'      => 'sendDataWithRx',
                     'function-data' => {:controller     => 'provider_dialogs',
                                         :modal_title    => N_('Delete Ansible Tower Provider'),
                                         :modal_text     => N_('Are you sure you want to delete the following Ansible Tower Provider?'),
                                         :api_url        => 'providers',
                                         :async_delete   => true,
                                         :redirect_url   => '/ems_automation/show_list',
                                         :component_name => 'RemoveGenericItemModal'}}
        )
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
          :ems_automation_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for this Ansible Tower Provider'),
          N_('Edit Tags')),
      ]
    ),
  ])
end
