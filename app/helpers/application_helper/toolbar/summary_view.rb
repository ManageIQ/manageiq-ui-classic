class ApplicationHelper::Toolbar::SummaryView < ApplicationHelper::Toolbar::Basic
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
