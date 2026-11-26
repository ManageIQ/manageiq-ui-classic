class VmInfraController < ApplicationController
  include VmCommon # common methods for vm controllers
  include VmRemote # methods for VM remote access
  include Mixins::VmShowMixin
  include Mixins::BreadcrumbsMixin

  before_action :check_privileges
  before_action :get_session_data

  after_action :cleanup_action
  after_action :set_session_data

  def self.table_name
    @table_name ||= "vm_infra"
  end

  def index
    flash_to_session
    redirect_to(:action => 'explorer')
  end

  def vm_live_logs
    require 'net/http'
    require 'uri'
    require 'json'

    @record = identify_record(params[:id], VmOrTemplate)
    return if performed?

    lines = (params[:lines] || 200).to_i.clamp(1, 2000)

    begin
      # Mint a short-lived API token for the current ManageIQ user
      api_token = Api::UserTokenService.new.generate_token(User.current_userid, "ui")

      uri = URI("#{request.base_url}/api/vms/#{@record.id}")
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = (uri.scheme == "https")

      req = Net::HTTP::Post.new(
        uri.path,
        {
          "Content-Type" => "application/json",
          "Accept"       => "application/json",
          "X-Auth-Token" => api_token
        }
      )
      req.body = {"action" => "fetch_logs", "resource" => {"lines" => lines}}.to_json

      res  = http.request(req)
      body = JSON.parse(res.body)

      @vm_log_output = if body["success"]
                         body.dig("result", "logs") || body["logs"]
                       else
                         "API Error: #{body['message'] || body.dig('error', 'message')}"
                       end
    rescue StandardError => e
      @vm_log_output = "Unable to fetch VM logs via ManageIQ API: #{e.message}"
    end

    render "vm_common/vm_live_logs" unless performed?
  end

  private

  def features
    [
      {
        :role  => "vandt_accord",
        :name  => :vandt,
        :title => _("VMs & Templates")
      },
      {
        :role  => "vms_filter_accord",
        :name  => :vms_filter,
        :title => _("VMs")
      },
      {
        :role  => "templates_filter_accord",
        :name  => :templates_filter,
        :title => _("Templates")
      },
    ].map { |hsh| ApplicationController::Feature.new_with_hash(hsh) }
  end

  def prefix_by_nodetype(nodetype)
    case TreeBuilder.get_model_for_prefix(nodetype).underscore
    when "miq_template" then "templates"
    when "vm"           then "vms"
    end
  end

  def set_elements_and_redirect_unauthorized_user
    @nodetype, _id = parse_nodetype_and_id(params[:id])
    prefix = prefix_by_nodetype(@nodetype)

    # Position in tree that matches selected record
    if role_allows?(:feature => "vandt_accord")
      set_active_elements_authorized_user('vandt_tree', 'vandt')
    elsif role_allows?(:feature => "#{prefix}_filter_accord")
      set_active_elements_authorized_user("#{prefix}_filter_tree", "#{prefix}_filter")
    else
      if (prefix == "vms" && role_allows?(:feature => "vms_instances_filter_accord")) ||
         (prefix == "templates" && role_allows?(:feature => "templates_images_filter_accord"))
        redirect_to(:controller => 'vm_or_template', :action => "explorer", :id => params[:id])
      else
        redirect_to(:controller => 'dashboard', :action => "auth_error")
      end
      return true
    end

    resolve_node_info(params[:id])
  end

  def tagging_explorer_controller?
    @explorer
  end

  def skip_breadcrumb?
    breadcrumb_prohibited_for_action?
  end

  def breadcrumbs_options
    {
      :breadcrumbs    => [
        {:title => _("Compute")},
        {:title => _("Infrastructure")},
        {:title => _("Virtual Machines")},
      ],
      :include_record => true,
      :x_node         => x_node_right_cell
    }
  end

  menu_section :inf
  feature_for_actions %w[vms_filter_accord templates_filter_accord], *ADV_SEARCH_ACTIONS
  feature_for_actions 'vm_show', :groups, :users, :patches
  feature_for_actions ['vm_protect', 'miq_template_protect'], :protect
  feature_for_actions ['vm_timeline', 'miq_template_timeline'], :tl_chooser
  feature_for_actions ['vm_perf', 'miq_template_perf'], :perf_top_chart
  feature_for_actions ['vm_live_logs'], :vm_live_logs
  has_custom_buttons
end
