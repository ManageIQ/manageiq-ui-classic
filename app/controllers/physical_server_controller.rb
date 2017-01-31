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


#  def show_list
#    process_show_list
#  end


  def show
    @display = params[:display] || "physical_server" unless pagination_or_gtl_request?

    @ph_server = @record = identify_record(params[:id])
    return if record_no_longer_exists?(@ph_server, 'PhysicalServer')

    case @display

    when "main"
      get_tagdata(@ph_server)
      drop_breadcrumb({:name => _("Physical Server"), :url => "/physical_server/show_list?page=#{@current_page}&refresh=y"}, true)
      drop_breadcrumb({:name => _("%{name} (Summary)") % {:name => @ph_server.name, :url => "physical_server/show/#{@ph_server.id}"}})
      @show_type = "main"

    end

  end



end
