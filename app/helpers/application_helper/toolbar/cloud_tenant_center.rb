class ApplicationHelper::Toolbar::CloudTenantCenter < ApplicationHelper::Toolbar::Basic
  button_group('cloud_tenant_vmdb', [
    select(
      :cloud_tenant_vmdb_choice,
      '',
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :cloud_tenant_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit Cloud Tenant'),
          t),
        button(
          :cloud_tenant_delete,
          'pficon pficon-edit fa-lg',
          t = N_('Delete Cloud Tenant'),
          t),
      ]
    ),
  ])
  button_group('cloud_tenant_policy', [
    select(
      :cloud_tenant_policy_choice,
      '',
      t = N_('Policy'),
      t,
      :items => [
        button(
          :cloud_tenant_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit tags for this Cloud Tenant'),
          N_('Edit Tags')),
      ]
    ),
  ])
  button_group('ems_cloud', [
    twostate(
      :view_dashboard,
      'fa fa-tachometer fa-1xplus',
      N_('Dashboard View'),
      nil,
      :url       => "/show/",
      :url_parms => "?display=dashboard",
      :klass     => ApplicationHelper::Button::ViewDashboard
    ),
    twostate(
      :view_summary,
      'fa fa-th-list',
      N_('Summary View'),
      nil,
      :url       => "/show/",
      :url_parms => "?display=main"
    ),
  ])
end
