class ApplicationHelper::Toolbar::MiqCapacityView < ApplicationHelper::Toolbar::Basic
  button_group('miq_capacity_download_main', [
    select(
      :miq_capacity_download_choice,
      'fa fa-download fa-lg',
      N_('Download'),
      nil,
      :klass => ApplicationHelper::Button::UtilizationDownload,
      :items => [
        button(
          :miq_capacity_download_text,
          'fa fa-file-text-o fa-lg',
          N_('Download this report in text format'),
          N_('Download as Text'),
          :url       => "/report_download",
          :url_parms => "?typ=txt",
          :klass     => ApplicationHelper::Button::MiqCapacity),
        button(
          :miq_capacity_download_csv,
          'fa fa-file-text-o fa-lg',
          N_('Download this report in CSV format'),
          N_('Download as CSV'),
          :url       => "/report_download",
          :url_parms => "?typ=csv",
          :klass     => ApplicationHelper::Button::MiqCapacity),
        button(
          :miq_capacity_download_pdf,
          'pficon pficon-print fa-lg',
          N_('Print or export this report in PDF format'),
          N_('Print or export as PDF'),
          :klass     => ApplicationHelper::Button::Basic,
          :popup     => true,
          :url       => "/report_download",
          :url_parms => "?typ=pdf"),
      ]
    ),
  ])
end
