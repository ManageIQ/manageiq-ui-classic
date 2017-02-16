class ApplicationHelper::Button::ZoneLogDepotEdit < ApplicationHelper::Button::DiagnosticsLogs
  def visible?
    return false if active_tree?(:diagnostics_tree) &&
                    (active_tab?('diagnostics_roles_servers') || active_tab?('diagnostics_servers_roles'))
    super
  end
end
