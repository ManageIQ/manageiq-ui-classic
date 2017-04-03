class ApplicationHelper::Button::HostProtect < ApplicationHelper::Button::Basic
  needs :@record

  def visible?
    true
  end
end
