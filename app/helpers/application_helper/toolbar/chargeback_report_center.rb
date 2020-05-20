class ApplicationHelper::Toolbar::ChargebackReportCenter < ApplicationHelper::Toolbar::Basic
  button_group('chargeback_download_main', [
    select(
      :chargeback_download_choice,
      'fa fa-download fa-lg',
      N_('Download'),
      nil,
      :klass => ApplicationHelper::Button::ChargebackDownloadChoice,
      :items => [
        button(
          :chargeback_download_text,
          'fa fa-file-text-o fa-lg',
          N_('Download this report in text format'),
          N_('Download as Text'),
          :klass => ApplicationHelper::Button::ChargebackDownload,
          :url   => "/render_txt"),
        button(
          :chargeback_download_csv,
          'fa fa-file-text-o fa-lg',
          N_('Download this report in CSV format'),
          N_('Download as CSV'),
          :klass => ApplicationHelper::Button::ChargebackDownload,
          :url   => "/render_csv"),
        button(
          :chargeback_download_pdf,
          'pficon pficon-print fa-lg',
          N_('Print or export this report in PDF format'),
          N_('Print or export as PDF'),
          :klass => ApplicationHelper::Button::Basic,
          :popup => true,
          :url   => "/render_pdf"),
      ]
    ),
    button(
      :chargeback_report_only,
      'fa fa-file-text-o fa-lg',
      N_('Show full screen report'),
      nil,
      :klass   => ApplicationHelper::Button::ChargebackReportOnly,
      :url     => "/report_only",
      :popup   => true,
      :confirm => N_("This will show the entire report (all rows) in your browser.  Do you want to proceed?")),
  ])
end
