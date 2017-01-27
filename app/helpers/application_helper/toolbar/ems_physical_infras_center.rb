class ApplicationHelper::Toolbar::EmsPhysicalInfrasCenter < ApplicationHelper::Toolbar::Basic
  button_group('ems_physical_infra_vmdb', [
    select(
      :ems_physical_infra_vmdb_choice,
      'fa fa-cog fa-lg',
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :ems_physical_infra_refresh,
          'fa fa-refresh fa-lg',
          N_('Refresh relationships and power states for all items related to the selected Infrastructure Providers'),
          N_('Refresh Relationships and Power States'),
          :url_parms => "main_div",
          :confirm   => N_("Refresh relationships and power states for all items related to the selected Infrastructure Providers?"),
          :enabled   => false,
          :onwhen    => "1+"),
        button(
          :ems_physical_infra_discover,
          'fa fa-search fa-lg',
          t = N_('Discover Infrastructure Providers'),
          t,
          :url       => "/discover",
          :url_parms => "?discover_type=ems"),
        separator,
        button(
          :ems_physical_infra_new,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Add a New Infrastructure Provider'),
          t,
          :url => "/new"),
        button(
          :ems_physical_infra_edit,
          'pficon pficon-edit fa-lg',
          N_('Select a single Infrastructure Provider to edit'),
          N_('Edit Selected Infrastructure Providers'),
          :url_parms => "main_div",
          :enabled   => false,
          :onwhen    => "1"),
        button(
          :ems_physical_infra_delete,
          'pficon pficon-delete fa-lg',
          N_('Remove selected Infrastructure Providers'),
          N_('Remove Infrastructure Providers'),
          :url_parms => "main_div",
          :confirm   => N_("Warning: The selected Infrastructure Providers and ALL of their components will be permanently removed!"),
          :enabled   => false,
          :onwhen    => "1+"),
      ]
    ),
  ])
end
