class PhysicalServerController  < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin



  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data



  def self.table_name
    @table_name ||= "physical_servers"
  end

  def get_session_data
    @title  = _("Physical Servers")
    @layout = "physical_server"
  end

  def collect_data(server_id)
    PhysicalServerService.new(server_id, self).all_data
  end

  def set_session_data
    session[:layout] = @layout
  end


end
