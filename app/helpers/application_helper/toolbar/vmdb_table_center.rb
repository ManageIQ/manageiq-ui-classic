class ApplicationHelper::Toolbar::VmdbTableCenter < ApplicationHelper::Toolbar::Basic
  button_group('support_reloading', [
    button(
      :db_refresh,
      'fa fa-refresh fa-lg',
      N_('Refresh this page'),
      nil,
      :klass => ApplicationHelper::Button::DbRefresh),
  ])
end
