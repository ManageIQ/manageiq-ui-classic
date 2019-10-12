class ApplicationHelper::Toolbar::EmsCloudCenter < ApplicationHelper::Toolbar::Basic
  button_group('ems_cloud_vmdb', [
    button(
      :refresh_server_summary,
      'fa fa-refresh fa-lg',
      N_('Refresh this page'),
      nil),
    select(
      :ems_cloud_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :ems_cloud_refresh,
          'fa fa-refresh fa-lg',
          N_('Refresh relationships and power states for all items related to this Cloud Provider'),
          N_('Refresh Relationships and Power States'),
          :confirm => N_("Refresh relationships and power states for all items related to this Cloud Provider?"),
          :klass   => ApplicationHelper::Button::EmsRefresh),
        separator,
        button(
          :ems_cloud_user_sync,
          'pficon pficon-edit fa-lg',
          t = N_('Sync Users from Cloud Provider'),
          t,
          :url   => "/sync_users",
          :klass => ApplicationHelper::Button::ProviderUserSync),
        button(
          :ems_cloud_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this Cloud Provider'),
          t,
          :full_path => "<%= edit_ems_cloud_path(@ems) %>"),
        button(
          :ems_cloud_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Remove this Cloud Provider from Inventory'),
          t,
          :url_parms => "&refresh=y",
          :confirm   => N_("Warning: This Cloud Provider and ALL of its components will be permanently removed!")),
      ]
    ),
  ])
  button_group('ems_cloud_policy', [
    select(
      :ems_cloud_policy_choice,
      nil,
      t = N_('Policy'),
      t,
      :items => [
        button(
          :ems_cloud_protect,
          'pficon pficon-edit fa-lg',
          N_('Manage Policies for this Cloud Provider'),
          N_('Manage Policies')),
        button(
          :ems_cloud_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for this Cloud Provider'),
          N_('Edit Tags')),
        button(
          :ems_cloud_check_compliance,
          'fa fa-search fa-lg',
          N_('Check Compliance of the last known configuration for this Cloud Manager'),
          N_('Check Compliance of Last Known Configuration'),
          :confirm => N_("Initiate Check Compliance of the last known configuration for this item?")),
      ]
    ),
  ])
  button_group('ems_cloud_monitoring', [
    select(
      :ems_cloud_monitoring_choice,
      nil,
      t = N_('Monitoring'),
      t,
      :items => [
        button(
          :ems_cloud_timeline,
          'ff ff-timeline fa-lg',
          N_('Show Timelines for this Cloud Provider'),
          N_('Timelines'),
          :klass     => ApplicationHelper::Button::EmsTimeline,
          :url_parms => "?display=timeline"),
      ]
    ),
  ])
  button_group('ems_cloud_authentication', [
    select(
      :ems_cloud_authentication_choice,
      'fa fa-lock fa-lg',
      t = N_('Authentication'),
      t,
      :items => [
        button(
          :ems_cloud_recheck_auth_status,
          'fa fa-search fa-lg',
          N_('Re-check Authentication Status for this Cloud Provider'),
          N_('Re-check Authentication Status'),
          :klass => ApplicationHelper::Button::GenericFeatureButton,
          :options => {:feature => :authentication_status}),
      ]
    ),
  ])
  button_group('ems_cloud', [
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
end
