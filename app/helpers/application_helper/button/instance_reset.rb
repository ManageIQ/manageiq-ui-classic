class ApplicationHelper::Button::InstanceReset < ApplicationHelper::Button::Basic
  needs :@record

  def visible?
    @record.supports_reset?
  end
end
