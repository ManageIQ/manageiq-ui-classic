class PrivilegeCheckerService
  def valid_session?(session, current_user)
    user_signed_in?(current_user) && session_active?(current_user.id) && server_ready?(current_user)
  end

  def user_session_timed_out?(session, current_user)
    user_signed_in?(current_user) && !session_active?(current_user.id)
  end

  private

  def user_signed_in?(current_user)
    !!current_user
  end

  def session_active?(user_id)
    return false unless user_id
    SessionActivityService.session_active?(user_id)
  end

  def server_ready?(current_user)
    current_user.try(:super_admin_user?) || MiqServer.my_server(true).logon_status == :ready
  end
end
