class ApplicationHelper::Button::OvirtUI < ApplicationHelper::Button::VmConsole
  needs :@record

  def visible?
    true
  end

  def disabled?
    false
  end
end
