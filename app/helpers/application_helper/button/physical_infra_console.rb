class ApplicationHelper::Button::PhysicalInfraConsole < ApplicationHelper::Button::Basic
  needs(:@record)

  def visible?
    @record.supports_console?
  end
end
