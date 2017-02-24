class ApplicationHelper::Button::DiagnosticsLogs < ApplicationHelper::Button::CollectLogs
  include ApplicationHelper::Button::Mixins::ActiveContextMixin

  def visible?
    active_tree?(:diagnostics_tree) && active_tab?('diagnostics_collect_logs')
  end
end
