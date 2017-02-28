class ResourcePoolController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericButtonMixin

  BUTTONS_PRESS_MAP = {
    "resource_pool_delete"  => :delete_resource_pools,
    "resource_pool_protect" => :assign_policies
  }

  def show
    @display = params[:display] || "main" unless pagination_or_gtl_request?

    @lastaction = "show"
    @showtype   = "config"
    @record = identify_record(params[:id])
    return if record_no_longer_exists?(@record)

    @gtl_url = "/show"
    drop_breadcrumb({:name => _("Resource Pools"),
                     :url  => "/resource_pool/show_list?page=#{@current_page}&refresh=y"}, true)

    case @display
    when "main", "summary_only"
      get_tagdata(@record)
      txt = @record.vapp ? _("(vApp)") : ""
      drop_breadcrumb(:name => _("%{name} %{text} (Summary)") % {:name => @record.name, :text => txt},
                      :url  => "/resource_pool/show/#{@record.id}")
      @showtype = "main"
      set_summary_pdf_data if @display == "summary_only"

    when "vms"
      drop_breadcrumb(:name => _("%{name} (Direct VMs)") % {:name => @record.name},
                      :url  => "/resource_pool/show/#{@record.id}?display=vms")
      @view, @pages = get_view(Vm, :parent => @record)  # Get the records (into a view) and the paginator
      @showtype = "vms"

    when "descendant_vms"
      drop_breadcrumb(:name => _("%{name} (All VMs - Tree View)") % {:name => @record.name},
                      :url  => "/resource_pool/show/#{@record.id}?display=descendant_vms&treestate=true")
      @showtype = "config"

      self.x_active_tree = :datacenter_tree
      @datacenter_tree = TreeBuilderDatacenter.new(:datacenter_tree, :datacenter, @sb, true, @record)

    when "all_vms"
      drop_breadcrumb(:name => "%{name} (All VMs)" % {:name => @record.name},
                      :url  => "/resource_pool/show/#{@record.id}?display=all_vms")
      @view, @pages = get_view(Vm, :parent => @record, :association => "all_vms") # Get the records (into a view) and the paginator
      @showtype = "vms"

    when "clusters"
      drop_breadcrumb(:name => _("%{name} (All %{title})") % {:name => @record.name, :title => title_for_clusters},
                      :url  => "/resource_pool/show/#{@record.id}?display=clusters")
      @view, @pages = get_view(EmsCluster, :parent => @record)  # Get the records (into a view) and the paginator
      @showtype = "clusters"

    when "resource_pools"
      drop_breadcrumb(:name => _("%{name} (All Resource Pools)") % {:name => @record.name},
                      :url  => "/resource_pool/show/#{@record.id}?display=resource_pools")
      @view, @pages = get_view(ResourcePool, :parent => @record)  # Get the records (into a view) and the paginator
      @showtype = "resource_pools"

    when "config_info"
      @showtype = "config"
      drop_breadcrumb(:name => _("Configuration"), :url => "/resource_pool/show/#{@record.id}?display=#{@display}")
    end

    replace_gtl_main_div if pagination_request?
  end

  def specific_buttons(pressed)
    method = BUTTONS_PRESS_MAP[pressed]
    send(method) if method
    return false if method == :delete_resource_pools
    return method
  end

  def assign_policies(resource=nil)
    super(resource || ResourcePool)
  end

  private

  def textual_group_list
    [%i(properties relationships), %i(configuration smart_management)]
  end
  helper_method :textual_group_list

  menu_section :inf
end
