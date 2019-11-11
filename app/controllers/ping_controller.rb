class PingController < ApplicationController
  def index
    raise PG::Error unless ActiveRecord::Base.connection.active?

    render :plain => 'pong', :status => 200
  end
end
