class ApplicationHelper::Toolbar::XHistory < ApplicationHelper::Toolbar::Basic
  button_group('history_main', [
    button(
      :summary_reload,
      'fa fa-refresh fa-lg',
      N_('Refresh this page'),
      nil,
      :url => "reload",
      :klass => ApplicationHelper::Button::SummaryReload),
  ])
end
