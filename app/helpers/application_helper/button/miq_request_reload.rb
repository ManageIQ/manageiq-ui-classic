class ApplicationHelper::Button::MiqRequestReload < ApplicationHelper::Button::MiqRequest
  needs :@showtype, :@record, :@request_tab

  def visible?
    return false unless super
    true
  end
end
