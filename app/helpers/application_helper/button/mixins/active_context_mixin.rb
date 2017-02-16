module ApplicationHelper::Button::Mixins::ActiveContextMixin
  def active_tree?(tree)
    if tree.kind_of?(Array)
      tree.include?(@view_context.x_active_tree)
    else
      tree == @view_context.x_active_tree
    end
  end

  def active_tab?(tab)
    if tab.kind_of?(Array)
      tab.include?(@view_context.active_tab)
    else
      tab == @view_context.active_tab
    end
  end
end
