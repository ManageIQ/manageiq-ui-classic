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
                       :ems_storage_edit,
                       'pficon pficon-edit fa-lg',
                       t = N_('Edit this Storage Manager'),
                       t
                     ),
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
  button_group('ems_storage_view', [
                 twostate(
                   :view_dashboard,
                   'fa fa-tachometer fa-1xplus',
                   N_('Dashboard View'),
                   nil,
                   :url       => "/",
                   :url_parms => "?display=dashboard",
                   :klass     => ApplicationHelper::Button::ViewDashboard
                 ),
                 twostate(
                   :view_summary,
                   'fa fa-th-list',
                   N_('Summary View'),
                   nil,
                   :url       => "/",
                   :url_parms => "?display=main"
                 ),
               ])
  # button_group('ems_storage_authentication', [
  #     select(
  #         :ems_storage_authentication_choice,
  #         nil,
  #         t = N_('Authentication'),
  #         t,
  #         :items => [
  #             button(
  #                 :ems_storage_recheck_auth_status,
  #                 'fa fa-search fa-lg',
  #                 N_('Re-check Authentication Status for this Storage Manager'),
  #                 N_('Re-check Authentication Status'),
  #                 :klass => ApplicationHelper::Button::GenericFeatureButton,
  #                 :options => {:feature => :authentication_status}),
  #         ]
  #     ),
  # ])
end
