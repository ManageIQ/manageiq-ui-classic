class ApplicationHelper::Button::View < ApplicationHelper::Button::ButtonWithoutRbacCheck
  def visible?
    return false if self[:id] == "view_tree" && !@show_tree_button
    @gtl_buttons.include?(self[:id].to_s)
  end

  def disabled?
    @gtl_type
  end
end
