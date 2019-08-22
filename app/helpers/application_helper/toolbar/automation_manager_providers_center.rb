class ApplicationHelper::Toolbar::AutomationManagerProvidersCenter < ApplicationHelper::Toolbar::Basic
  button_group('provider_vmdb', [
    select(
      :provider_vmdb_choice,
      'fa fa-cog fa-lg',
      t = N_('Configuration'),
      t,
      :enabled => true,
      :items   => [
        button(
          :automation_manager_refresh_provider,
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
          :automation_manager_add_provider,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Add a new Provider'),
          t,
          :enabled => true,
          :url     => "new"
        ),
        button(
          :automation_manager_edit_provider,
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
          :automation_manager_delete_provider,
          'pficon pficon-delete fa-lg',
          t = N_('Remove selected items from Inventory'),
          t,
          :url          => "delete",
          :url_parms    => "main_div",
          :send_checked => true,
          :confirm      => N_("Warning: The selected items and ALL of their components will be permanently removed!"),
          :enabled      => false,
          :onwhen       => "1+"
        ),
      ]
    )
  ])
  button_group('automation_manager_policy', [
    select(
      :automation_manager_policy_choice,
      'fa fa-shield fa-lg',
      t = N_('Policy'),
      t,
      :enabled => false,
      :onwhen  => "1+",
      :items   => [
        button(
          :automation_manager_provider_tag,
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
