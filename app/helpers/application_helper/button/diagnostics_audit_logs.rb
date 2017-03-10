class ApplicationHelper::Button::DiagnosticsAuditLogs < ApplicationHelper::Button::Basic
  include ApplicationHelper::Button::Mixins::ActiveContextMixin

  def visible?
    active_tree?(:diagnostics_tree) && active_tab?('diagnostics_audit_log')
  end
end
