class ApplicationHelper::Button::PolicyCopy < ApplicationHelper::Button::Basic
  def visible?
    x_active_tree == :policy_tree
  end
  delegate :x_active_tree, :to => :@view_context
end
