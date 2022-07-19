class ApplicationHelper::Button::NativeConsole < ApplicationHelper::Button::Basic
  needs(:@record)

  def visible?
    @record.supports?(:native_console)
  end
end
