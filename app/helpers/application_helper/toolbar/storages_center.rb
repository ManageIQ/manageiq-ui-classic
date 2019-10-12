class ApplicationHelper::Toolbar::StoragesCenter < ApplicationHelper::Toolbar::Basic
  button_group('storage_vmdb', [
    select(
      :storage_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :enabled => false,
      :onwhen  => "1+",
      :items   => [
        button(
          :storage_scan,
          'fa fa-search fa-lg',
          N_('Perform SmartState Analysis on the selected Datastores'),
          N_('Perform SmartState Analysis'),
          :url_parms    => "main_div",
          :send_checked => true,
          :confirm      => N_("Perform SmartState Analysis on the selected Datastores?"),
          :enabled      => false,
          :onwhen       => "1+"),
        button(
          :storage_delete,
          'pficon pficon-delete fa-lg',
          N_('Remove selected Datastores from Inventory'),
          N_('Remove Datastores from Inventory'),
          :url_parms    => "main_div",
          :send_checked => true,
          :confirm      => N_("Warning: The selected Datastores and ALL of their components will be permanently removed!"),
          :enabled      => false,
          :onwhen       => "1+"),
      ]
    ),
  ])
  button_group('storage_policy', [
    select(
      :storage_policy_choice,
      nil,
      t = N_('Policy'),
      t,
      :enabled => false,
      :onwhen  => "1+",
      :items   => [
        button(
          :storage_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for the selected Datastores'),
          N_('Edit Tags'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1+"),
      ]
    ),
  ])
end
