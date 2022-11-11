class ApplicationHelper::Button::ServersDeleteServer < ApplicationHelper::Button::Basic
  def visible?
    @view_context.x_active_tree == :diagnostics_tree &&
      %w[diagnostics_server_list].include?(@sb[:active_tab])
  end
end
