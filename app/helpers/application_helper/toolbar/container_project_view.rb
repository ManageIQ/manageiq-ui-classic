class ApplicationHelper::Toolbar::ContainerProjectView < ApplicationHelper::Toolbar::Basic
  button_group('container_project', [
    twostate(
      :view_dashboard,
      'fa fa-tachometer fa-1xplus',
      N_('Dashboard View'),
      nil,
      :url       => "/show",
      :url_parms => "?display=dashboard",
      :klass     => ApplicationHelper::Button::ViewDashboard
    ),
    twostate(
      :view_summary,
      'fa fa-th-list',
      N_('Summary View'),
      nil,
      :url       => "/show",
      :url_parms => "?display=main"
    ),
  ])
end
