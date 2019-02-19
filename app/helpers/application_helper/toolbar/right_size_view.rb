class ApplicationHelper::Toolbar::RightSizeView < ApplicationHelper::Toolbar::Basic
  button_group('right_size_view', [
    button(
      :right_size_print,
      'pficon pficon-print fa-lg',
      N_('Print or export'),
      nil,
      :klass => ApplicationHelper::Button::Basic,
      :url   => "/right_size_print",
      :popup => true
    ),
  ])
end
