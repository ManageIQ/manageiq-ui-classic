class ApplicationHelper::Button::ManagementConsole < ApplicationHelper::Button::Basic
  needs(:@record)

  def visible?
    @record.supports?(:management_console)
  end
end
