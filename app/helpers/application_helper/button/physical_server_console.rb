class ApplicationHelper::Button::PhysicalServerConsole < ApplicationHelper::Button::Basic
  def visible?
    @record.supports?(:console)
  end
end
