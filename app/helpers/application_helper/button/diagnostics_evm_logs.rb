class ApplicationHelper::Button::DiagnosticsEvmLogs < ApplicationHelper::Button::Basic
  include ApplicationHelper::Button::Mixins::ActiveContextMixin

  def visible?
    active_tree?(:diagnostics_tree) && active_tab?('diagnostics_evm_log')
  end
end
