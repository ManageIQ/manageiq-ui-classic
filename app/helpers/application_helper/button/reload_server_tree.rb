class ApplicationHelper::Button::ReloadServerTree < ApplicationHelper::Button::Basic
  include ApplicationHelper::Button::Mixins::ActiveContextMixin

  def visible?
    active_tree?(:diagnostics_tree) && active_tab?(%w(diagnostics_roles_servers diagnostics_servers_roles))
  end
end
