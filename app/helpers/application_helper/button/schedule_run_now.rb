class ApplicationHelper::Button::ScheduleRunNow < ApplicationHelper::Button::Basic
  include ApplicationHelper::Button::Mixins::ActiveContextMixin

  def visible?
    active_tree?(:settings_tree)
  end
end
