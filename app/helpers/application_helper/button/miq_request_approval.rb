class ApplicationHelper::Button::MiqRequestApproval < ApplicationHelper::Button::MiqRequest
  needs :@showtype, :@record, :@request_tab

  def visible?
    return false unless super
    return false if %w[approved denied].include?(@record.approval_state) || @showtype == "miq_provisions"

    true
  end
end
