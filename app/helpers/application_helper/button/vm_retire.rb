class ApplicationHelper::Button::VmRetire < ApplicationHelper::Button::Basic
  needs :@record

  def visible?
    @record.supports?(:retire)
  end

  def disabled?
    false
  end
end
