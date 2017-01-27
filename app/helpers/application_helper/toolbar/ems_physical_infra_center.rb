class ApplicationHelper::Toolbar::EmsPhysicalInfraCenter < ApplicationHelper::Toolbar::Basic
  button_group('ems_physical_infra_vmdb', [
    button(
      :refresh_server_summary,
      'fa fa-repeat fa-lg',
      N_('Reload Current Display'),
      nil),
    select(
      :ems_physical_infra_vmdb_choice,
      'fa fa-cog fa-lg',
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :ems_physical_infra_refresh,
          'fa fa-refresh fa-lg',
          N_('Refresh relationships and power states for all items related to this Infrastructure Provider'),
          N_('Refresh Relationships and Power States'),
          :confirm => N_("Refresh relationships and power states for all items related to this Infrastructure Provider?")),
        separator,
        button(
          :ems_physical_infra_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this Infrastructure Provider'),
          t),
        button(
          :ems_physical_infra_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Remove this Infrastructure Provider'),
          t,
          :url_parms => "&refresh=y",
          :confirm   => N_("Warning: This Infrastructure Provider and ALL of its components will be permanently removed!")),
      ]
    ),
  ])
end
