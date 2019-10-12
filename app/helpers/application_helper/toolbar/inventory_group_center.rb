class ApplicationHelper::Toolbar::InventoryGroupCenter < ApplicationHelper::Toolbar::Basic
  button_group('provider_vmdb', [
    select(
      :provider_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :enabled => true,
      :items   => [
        button(
          :automation_manager_refresh,
          'fa fa-refresh fa-lg',
          N_('Refresh relationships for all items related to this Provider'),
          N_('Refresh Relationships and Power states'),
          :url     => "refresh",
          :confirm => N_("Refresh relationships for all items related to this Provider?")),
        separator,
        button(
          :automation_manager_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this Provider'),
          t,
          :url => "edit"),
        button(
          :automation_manager_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Remove this Provider from Inventory'),
          t,
          :url     => "delete",
          :confirm => N_("Warning: The selected Provider and ALL of their components will be permanently removed!")),
      ]
    ),
  ])
end
