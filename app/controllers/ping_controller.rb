class PingController < ApplicationController
  def index
    if ActiveRecord::Base.connection.active?
      render :plain => 'pong', :status => 200
    else
      raise PG::Error
    end
  end
end
