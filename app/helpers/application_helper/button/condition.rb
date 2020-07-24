class ApplicationHelper::Button::Condition < ApplicationHelper::Button::ReadOnly
  def role_allows_feature?
    @view_context.x_active_tree == :condition_tree && role_allows?(:feature => self[:child_id])
  end
end
