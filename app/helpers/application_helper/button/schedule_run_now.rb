class ApplicationHelper::Button::ScheduleRunNow < ApplicationHelper::Button::ButtonWithoutRbacCheck
  include ApplicationHelper::Button::Mixins::ActiveContextMixin

  def visible?
    active_tree?(:settings_tree)
  end
end
