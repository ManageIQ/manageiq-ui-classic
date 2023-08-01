class ApplicationHelper::Button::HostEdit < ApplicationHelper::Button::Basic
  needs :@record

  def disabled?
    !@record.supports?(:update)
  end
end
