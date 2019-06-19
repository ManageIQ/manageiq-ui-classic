# used to serve static angular templates from under app/views/static/

class StaticController < ActionController::Base
  # Added to satisfy Brakeman, https://github.com/presidentbeef/brakeman/pull/953
  protect_from_forgery :with => :exception

  include HighVoltage::StaticPage
  helper ApplicationHelper

  def favicon
    redirect_to(ApplicationHelper.miq_favicon_path)
  end
end
