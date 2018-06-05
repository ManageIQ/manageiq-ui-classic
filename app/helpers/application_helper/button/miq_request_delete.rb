class ApplicationHelper::Button::MiqRequestDelete < ApplicationHelper::Button::Basic
  needs :@record, :@request_tab
  delegate :current_user, :to => :@view_context

  def role_allows_feature?
    prefix = case @request_tab
             when 'ae', 'host'
               "#{@request_tab}_"
             else
               ""
             end
    # check RBAC on separate button
    role_allows?(:feature => "#{prefix}#{self[:id]}")
  end

  def disabled?
    requester = current_user
    return false if requester.role_allows?(:feature => "miq_request_superadmin")
    @error_message = _("Users are only allowed to delete their own requests") if requester.name != @record.requester_name
    if %w(approved denied).include?(@record.approval_state)
      @error_message = _("%{approval_states} requests cannot be deleted") %
        {:approval_states => @record.approval_state.titleize}
    end
    @error_message.present?
  end
end
