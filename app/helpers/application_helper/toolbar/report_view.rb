class ApplicationHelper::Toolbar::ReportView < ApplicationHelper::Toolbar::Basic
  button_group('ght_main', [
    twostate(
      :view_graph,
      'fa fa-pie-chart',
      N_('Graph View'),
      nil,
      :url       => "explorer",
      :url_parms => "?type=graph",
      :klass     => ApplicationHelper::Button::ViewGHT),
    twostate(
      :view_hybrid,
      'fa fa fa-th-list',
      N_('Hybrid View'),
      nil,
      :url       => "explorer",
      :url_parms => "?type=hybrid",
      :klass     => ApplicationHelper::Button::ViewGHT),
    twostate(
      :view_tabular,
      'fa fa-file-text-o',
      N_('Tabular View'),
      nil,
      :url       => "explorer",
      :url_parms => "?type=tabular",
      :klass     => ApplicationHelper::Button::ViewGHTAlways),
    twostate(
      :view_data,
      'pficon pficon-filter',
      N_('Data View'),
      nil,
      :url       => "explorer",
      :url_parms => "?type=data",
      :klass     => ApplicationHelper::Button::ViewGHTAlways),
  ])
  button_group('download_main', [
    select(
      :download_choice,
      'fa fa-download fa-lg',
      N_('Download'),
      nil,
      :klass => ApplicationHelper::Button::ReportDownloadChoice,
      :items => [
        button(
          :render_report_txt,
          'fa fa-file-text-o fa-lg',
          N_('Download this report in text format'),
          N_('Download as Text'),
          :keepSpinner => true,
          :url_parms   => "?render_type=txt",
          :klass       => ApplicationHelper::Button::RenderReport),
        button(
          :render_report_csv,
          'fa fa-file-text-o fa-lg',
          N_('Download this report in CSV format'),
          N_('Download as CSV'),
          :keepSpinner => true,
          :url_parms   => "?render_type=csv",
          :klass       => ApplicationHelper::Button::RenderReport),
        button(
          :render_report_pdf,
          'pficon pficon-print fa-lg',
          N_('Print or export this report in PDF format'),
          N_('Print or export as PDF'),
          :keepSpinner => true,
          :klass       => ApplicationHelper::Button::RenderReport,
          :url_parms   => "?render_type=pdf"),
      ]
    ),
  ])
end
