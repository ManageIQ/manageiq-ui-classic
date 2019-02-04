# **not** inheriting from ApplicationController
# this controller should stick to JSON

class UiController < ActionController::Base
  if Vmdb::Application.config.action_controller.allow_forgery_protection
    # Add CSRF protection for this controller, see ApplicationController for details
    protect_from_forgery(:secret => SecureRandom.hex(64),
                         :with   => :exception)
  end

  def keepalive
    # 401 when session timed out,
    # 422 when invalid csrf,
    # 200 otherwise

    head :unauthorized unless session[:userid]
    render :json => {
      :timeout => ::Settings.session.timeout,
    }
  end

  rescue_from StandardError, :with => :error_handler
  def error_handler(e)
    status = 500
    status = 422 if ActionController::InvalidAuthenticityToken === e

    render :json => {:error => e, :message => e.message}, :status => status
  end
end
