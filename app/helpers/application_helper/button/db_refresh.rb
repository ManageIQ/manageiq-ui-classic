class ApplicationHelper::Button::DbRefresh < ApplicationHelper::Button::Basic
  include ApplicationHelper::Button::Mixins::ActiveContextMixin

  def visible?
    active_tab?(%w(db_connections db_details db_indexes db_settings))
  end
end
