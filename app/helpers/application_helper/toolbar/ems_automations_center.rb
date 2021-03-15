class ApplicationHelper::Toolbar::EmsAutomationsCenter < ApplicationHelper::Toolbar::Basic
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
          N_('Refresh relationships for all items related to the selected items'),
          N_('Refresh Relationships and Power states'),
          :url          => "refresh",
          :url_parms    => "main_div",
          :send_checked => true,
          :confirm      => N_("Refresh relationships for all items related to the selected items?"),
          :enabled      => false,
          :onwhen       => "1+"
        ),
        separator,
        button(
          :ems_automation_add_provider,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Add a new Provider'),
          t,
          :enabled => true,
          :url     => "new"
        ),
        button(
          :ems_automation_edit_provider,
          'pficon pficon-edit fa-lg',
          N_('Select a single item to edit'),
          N_('Edit Selected item'),
          :url          => "edit",
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1"
        ),
        button(
          :ems_automation_delete_provider,
          'pficon pficon-delete fa-lg',
          t = N_('Remove selected items from Inventory'),
          t,
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1+",
          :data  => {'function'      => 'sendDataWithRx',
                     'function-data' => {:controller     => 'provider_dialogs',
                                         :modal_title    => N_('Delete Ansible Tower Providers'),
                                         :modal_text     => N_('Are you sure you want to delete the following Ansible Tower Providers?'),
                                         :api_url        => 'providers',
                                         :async_delete   => true,
                                         :tree_select    => 'root',
                                         :component_name => 'RemoveGenericItemModal'}}
        ),
      ]
    )
  ])
  button_group('ems_automation_policy', [
    select(
      :ems_automation_policy_choice,
      nil,
      t = N_('Policy'),
      t,
      :enabled => false,
      :onwhen  => "1+",
      :items   => [
        button(
          :ems_automation_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for the selected Ansible Tower Providers'),
          N_('Edit Tags'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :klass        => ApplicationHelper::Button::ButtonWithoutRbacCheck,
          :onwhen       => "1+"),
      ]
    ),
  ])
end
