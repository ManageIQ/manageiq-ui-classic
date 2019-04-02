class ApplicationHelper::Button::MiqTaskCanceljob < ApplicationHelper::Button::Basic
  def visible?
    %w(all_tasks my_tasks).include?(@layout)
  end
end
