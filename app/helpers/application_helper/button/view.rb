class ApplicationHelper::Button::View < ApplicationHelper::Button::ButtonWithoutRbacCheck
  # tree view GTL button is only visible on special screens
  GTL_VIEW_TREE_BUTTON = [
    'chargeback_rate'
  ]

  def visible?
    return false if self[:id] == "view_tree" && !GTL_VIEW_TREE_BUTTON.include?(@layout)
    # only hide gtl button if they are not in @gtl_buttons
    !@gtl_buttons || @gtl_buttons.include?(self[:id].to_s)
  end

  def disabled?
    @gtl_type
  end
end
