class ApplicationHelper::Toolbar::EmsNetworkCenter < ApplicationHelper::Toolbar::Basic
  button_group('ems_network_vmdb', [
    button(
      :refresh_server_summary,
      'fa fa-refresh fa-lg',
      N_('Refresh this page'),
      nil),
    select(
      :ems_network_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :ems_network_refresh,
          'fa fa-refresh fa-lg',
          N_('Refresh relationships and power states for all items related to this Network Provider'),
          N_('Refresh Relationships and Power States'),
          :confirm => N_("Refresh relationships and power states for all items related to this Network Provider?"),
          :klass   => ApplicationHelper::Button::EmsRefresh),
        separator,
        button(
          :ems_network_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this Network Provider'),
          t,
          :klass => ApplicationHelper::Button::EmsNetwork),
        button(
          :ems_network_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Remove this Network Provider from Inventory'),
          t,
          :url_parms => "&refresh=y",
          :confirm   => N_("Warning: This Network Provider and ALL of its components will be permanently removed!")),
      ]
    ),
  ])
  button_group('ems_network_policy', [
    select(
      :ems_network_policy_choice,
      nil,
      t = N_('Policy'),
      t,
      :items => [
        button(
          :ems_network_protect,
          'pficon pficon-edit fa-lg',
          N_('Manage Policies for this Network Provider'),
          N_('Manage Policies')),
        button(
          :ems_network_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for this Network Provider'),
          N_('Edit Tags')),
      ]
    ),
  ])
  button_group('ems_network_monitoring', [
    select(
      :ems_network_monitoring_choice,
      nil,
      t = N_('Monitoring'),
      t,
      :items => [
        button(
          :ems_network_timeline,
          'ff ff-timeline fa-lg',
          N_('Show Timelines for this Network Provider'),
          N_('Timelines'),
          :klass     => ApplicationHelper::Button::EmsTimeline,
          :url_parms => "?display=timeline"),
      ]
    ),
  ])
end
