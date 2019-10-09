class ApplicationHelper::Toolbar::EmsStorageCenter < ApplicationHelper::Toolbar::Basic
  button_group('ems_storage_vmdb', [
                 button(
                   :refresh_server_summary,
                   'fa fa-refresh fa-lg',
                   N_('Refresh this page'),
                   nil),
                 select(
                   :ems_storage_vmdb_choice,
                   nil,
                   t = N_('Configuration'),
                   t,
                   :items => [
                     button(
                       :ems_storage_refresh,
                       'fa fa-refresh fa-lg',
                       N_('Refresh relationships and power states for all items related to this Storage Manager'),
                       N_('Refresh Relationships and Power States'),
                       :confirm => N_("Refresh relationships and power states for all items related to this Storage Manager?")),
                     separator,
                     button(
                       :ems_storage_delete,
                       'pficon pficon-delete fa-lg',
                       t = N_('Remove this Storage Manager from Inventory'),
                       t,
                       :url_parms => "&refresh=y",
                       :confirm   => N_("Warning: This Storage Manager and ALL of its components will be permanently removed!")),
                   ]
                 ),
               ])
  button_group('ems_storage_policy', [
                 select(
                   :ems_storage_policy_choice,
                   nil,
                   t = N_('Policy'),
                   t,
                   :items => [
                     button(
                       :ems_storage_protect,
                       'pficon pficon-edit fa-lg',
                       N_('Manage Policies for this Storage Manager'),
                       N_('Manage Policies')),
                     button(
                       :ems_storage_tag,
                       'pficon pficon-edit fa-lg',
                       N_('Edit Tags for this Storage Manager'),
                       N_('Edit Tags')),
                   ]
                 ),
               ])
  button_group('ems_storage_monitoring', [
                 select(
                   :ems_storage_monitoring_choice,
                   nil,
                   t = N_('Monitoring'),
                   t,
                   :items => [
                     button(
                       :ems_storage_timeline,
                       'ff ff-timeline fa-lg',
                       N_('Show Timelines for this Storage Manager'),
                       N_('Timelines'),
                       :options   => {:feature => :timeline},
                       :klass     => ApplicationHelper::Button::EmsStorageTimeline,
                       :url       => "/show",
                       :url_parms => "?display=timeline"),
                   ]
                 ),
               ])
end
