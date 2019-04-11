class TopologyController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  # subclasses need to provide:
  #
  # @layout = 'xxx_topology';
  # @service_class = XxxTopologyService;
  #
  # Layout has to match the route to the controller and in turn the controller
  # name as it is used in the #show action.

  class << self
    attr_reader :layout
    attr_reader :service_class
  end

  toolbar :topology

  def show
    @lastaction = 'show'
    @display = @showtype = 'topology'
  end

  def index
    redirect_to(:action => 'show')
  end

  def data
    render :json => {:data => generate_topology(params[:id])}
  end

  private

  def set_session_data
    session[:layout] = self.class.layout
  end

  def get_session_data
    @layout = self.class.layout
  end

  def generate_topology(provider_id)
    self.class.service_class.new(provider_id).build_topology.merge(:settings => current_user.settings[:topology])
  end
end
