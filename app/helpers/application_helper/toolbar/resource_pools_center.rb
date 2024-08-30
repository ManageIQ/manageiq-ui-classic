class ApplicationHelper::Toolbar::ResourcePoolsCenter < ApplicationHelper::Toolbar::Basic
  button_group('resource_pool_vmdb', [
    select(
      :resource_pool_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :enabled => false,
      :onwhen  => "1+",
      :items   => [
        button(
          :resource_pool_delete,
          'pficon pficon-delete fa-lg',
          N_('Remove selected Resource Pools from Inventory'),
          N_('Remove Resource Pools from Inventory'),
          :url_parms    => "main_div",
          :send_checked => true,
          :confirm      => N_("Warning: The selected Resource Pools and ALL of their components will be permanently removed!"),
          :enabled      => false,
          :onwhen       => "1+"),
      ]
    ),
  ])
  button_group('resource_pool_policy', [
    select(
      :resource_pool_policy_choice,
      nil,
      t = N_('Policy'),
      t,
      :enabled => false,
      :onwhen  => "1+",
      :items   => [
        button(
          :resource_pool_protect,
          'pficon pficon-edit fa-lg',
          N_('Manage Policies for the selected Resource Pools'),
          N_('Manage Policies'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1+"),
        button(
          :resource_pool_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for the selected Resource Pools'),
          N_('Edit Tags'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1+"),
      ]
    ),
  ])
end
