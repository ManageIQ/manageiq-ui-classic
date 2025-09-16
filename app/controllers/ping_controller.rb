class PingController < ApplicationController
  def index
    ActiveRecord::Base.connectable!

    render :plain => 'pong', :status => 200
  end

  private def error_handler(e)
    message =
      case e
      when *ActiveRecord::Base::CONNECTIVITY_ERRORS
        "Unable to connect to the database"
      else
        "Unknown"
      end
    message = "ERROR: #{message} (#{e.class.name})"
    Rails.logger.error("#{message} - #{e.message}")
    render :plain => message, :status => 500
  end
end
