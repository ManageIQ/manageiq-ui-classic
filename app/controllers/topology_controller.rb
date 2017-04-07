class TopologyController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  # subclasses need to provide:
  #
  # @layout = 'xxx_topology';
  # @service_class = XxxTopologyService;
  # @ng_controller = 'xxTopologyController'
  #
  # Layout has to match the route to the controller and in turn the controller
  # name as it is used in the #show action.

  class << self
    attr_reader :layout, :service_class, :entities, :ng_controller

    private

    # Method to declare entities for a topology controller
    # The created entities can be accessed in the views using `controller.entities`
    #
    # The required params are:
    #   :kind   - an ActiveRecord class as a string
    #   :class  - an array of CSS classes for the legend
    #   :icon   - an UTF-8 character for the corresponding fonticon
    #   :height - the height of the icon in pixels
    #   :label  - The displayed label, ideally wrapped with a _() call
    def add_entity(entity)
      @entities ||= []
      @entities << entity
    end
  end

  delegate :entities, :to => :class
  delegate :ng_controller, :to => :class

  toolbar :topology

  def show
    # When navigated here without id, it means this is a general view for all providers (not for a specific provider)
    # all previous navigation should not be displayed in breadcrumbs as the user could arrive from
    # any other page in the application.
    @breadcrumbs.clear if params[:id].nil?
    drop_breadcrumb(:name => _('Topology'), :url => "/#{self.class.layout}/show/#{params[:id]}")
    @lastaction = 'show'
    @display = @showtype = 'topology'
    render :template => 'shared/topology'
  end

  def index
    redirect_to :action => 'show'
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
