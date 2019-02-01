# **not** inheriting from ApplicationController
# this controller should stick to JSON

class UiController < ActionController::Base
  if Vmdb::Application.config.action_controller.allow_forgery_protection
    # Add CSRF protection for this controller, see ApplicationController for details
    protect_from_forgery(:secret => SecureRandom.hex(64),
                         :with   => :exception)
  end

  def keepalive
    head :unauthorized unless session[:userid]
    render :json => {
      :timeout => ::Settings.session.timeout,
    }
  end
end
