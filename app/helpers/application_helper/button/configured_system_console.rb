class ApplicationHelper::Button::ConfiguredSystemConsole < ApplicationHelper::Button::Basic
  needs :@record

  def visible?
    @record.supports_console?
  end
end
