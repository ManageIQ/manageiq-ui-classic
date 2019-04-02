class PingController < ApplicationController
  def index
    if ActiveRecord::Base.connection.active?
      render :text => 'pong', :status => 200
    else
      raise PG::Error
    end
  end
end
