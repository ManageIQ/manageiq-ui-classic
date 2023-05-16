class ApplicationHelper::Toolbar::DashboardSummaryToggleView < ApplicationHelper::Toolbar::Basic
  button_group('ems_container_dashboard', [
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
                   :url_parms => "?display=main",
                   :klass     => ApplicationHelper::Button::ViewSummary
                 ),
               ])
  button_group('summary_download', [
                 button(
                   :download_view,
                   'pficon pficon-print fa-lg',
                   N_('Print or export summary'),
                   nil,
                   :klass => ApplicationHelper::Button::Basic,
                   :url   => "/download_summary_pdf",
                   :popup => true
                 ),
               ])
end
