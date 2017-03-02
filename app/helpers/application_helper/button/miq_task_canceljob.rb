class ApplicationHelper::Button::MiqTaskCanceljob < ApplicationHelper::Button::Basic
  def visible?
    !%w(all_tasks all_ui_tasks).include?(@layout)
  end
end
