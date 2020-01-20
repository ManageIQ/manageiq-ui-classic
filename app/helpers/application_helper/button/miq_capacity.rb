class ApplicationHelper::Button::MiqCapacity < ApplicationHelper::Button::Basic
  def visible?
    @view_context.sandbox[:active_tab] == 'report' && @sb[:summary].present?
  end
end
