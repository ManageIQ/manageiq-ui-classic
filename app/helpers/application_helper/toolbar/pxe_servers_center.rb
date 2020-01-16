class ApplicationHelper::Toolbar::PxeServersCenter < ApplicationHelper::Toolbar::Basic
  button_group('pxe_server_vmdb', [
    select(
      :pxe_server_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :pxe_server_new,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Add a New PXE Server'),
          t,
          :klass => ApplicationHelper::Button::ButtonNewDiscover),
        button(
          :pxe_server_edit,
          'pficon pficon-edit fa-lg',
          N_('Select a single PXE Servers to edit'),
          N_('Edit Selected PXE Servers'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1"),
        button(
          :pxe_server_delete,
          'pficon pficon-delete fa-lg',
          N_('Remove selected PXE Servers from Inventory'),
          N_('Remove PXE Servers from Inventory'),
          :url_parms    => "main_div",
          :send_checked => true,
          :confirm      => N_("Warning: The selected PXE Servers and ALL of their components will be permanently removed!"),
          :enabled      => false,
          :onwhen       => "1+"),
        separator,
        button(
          :pxe_server_refresh,
          'fa fa-refresh fa-lg',
          N_('Refresh Relationships for selected PXE Servers'),
          N_('Refresh Relationships'),
          :url_parms    => "main_div",
          :send_checked => true,
          :confirm      => N_("Refresh Relationships for selected PXE Servers?"),
          :enabled      => false,
          :onwhen       => "1+"),
      ]
    ),
  ])
  button_group('pxe_server_policy', [
    select(
      :pxe_server_policy_choice,
      nil,
      t = N_('Policy'),
      t,
      :items => [
        button(
          :pxe_server_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags selected Pxe Servers'),
          N_('Edit Tags'),
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1+"),
      ]
    ),
  ])
end
