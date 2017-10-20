class ApplicationHelper::Button::PhInfraConsole < ApplicationHelper::Button::Basic
  needs(:@record)

  def visible?
    @record.supports_console?
  end

  private

  def ems?
    @record.ems_id
  end
end
