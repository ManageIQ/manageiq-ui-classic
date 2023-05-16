class ApplicationHelper::Button::MiqRequestDelete < ApplicationHelper::Button::MiqRequest
  needs :@record, :@request_tab
  delegate :current_user, :to => :@view_context

  def disabled?
    requester = current_user
    return false if requester.miq_user_role.request_admin_user?

    @error_message = _("Users are only allowed to delete their own requests") if requester.name != @record.requester_name
    if %w[approved denied].include?(@record.approval_state)
      @error_message = _("%{approval_states} requests cannot be deleted") %
                       {:approval_states => @record.approval_state.titleize}
    end
    @error_message.present?
  end
end
