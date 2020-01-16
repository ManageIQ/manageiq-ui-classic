class ApplicationHelper::Toolbar::PxeServerCenter < ApplicationHelper::Toolbar::Basic
  button_group('pxe_server_vmdb', [
    select(
      :pxe_server_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :pxe_server_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this PXE Server'),
          t),
        button(
          :pxe_server_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Remove this PXE Server from Inventory'),
          t,
          :url_parms => "&refresh=y",
          :confirm   => N_("Warning: This PXE Server and ALL of its components will be permanently removed!")),
        separator,
        button(
          :pxe_server_refresh,
          'fa fa-refresh fa-lg',
          N_('Refresh Relationships for this PXE Server'),
          N_('Refresh Relationships'),
          :confirm => N_("Refresh Relationships for this PXE Server?")),
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
          N_('Edit Tags for this Pxe Server'),
          N_('Edit Tags')),
      ]
    ),
  ])
end
