class ApplicationHelper::Toolbar::OptimizationsCenter < ApplicationHelper::Toolbar::Basic
  button_group('optimizations', [
    button(
      :refresh,
      'fa fa-refresh fa-lg',
      N_('Refresh the list'),
      nil,
      :data  => {'function'      => 'sendDataWithRx',
                 'function-data' => {'controller' => 'OptimizationController',
                                     'action'     => 'refresh'}},
      :klass => ApplicationHelper::Button::ButtonWithoutRbacCheck),
  ])
end
