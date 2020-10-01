class ApplicationHelper::Button::ConfigurationProfileConsole < ApplicationHelper::Button::Basic
  needs :@record

  def visible?
    @record.supports_console?
  end
end
