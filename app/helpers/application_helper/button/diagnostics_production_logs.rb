class ApplicationHelper::Button::DiagnosticsProductionLogs < ApplicationHelper::Button::Basic
  include ApplicationHelper::Button::Mixins::ActiveContextMixin

  def visible?
    active_tree?(:diagnostics_tree) && active_tab?('diagnostics_production_log')
  end
end
