class ResourcePoolController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericButtonMixin
  include Mixins::GenericSessionMixin

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

  # handle buttons pressed on the button bar
  def button
    restore_edit_for_search
    copy_sub_item_display_value_to_params

    if button_sub_item_display_values.include?(@display) # Need to check, since RPs contain RPs
      handle_sub_item_presses(params[:pressed]) do |pfx|
        process_vm_buttons(pfx)

        return if button_control_transferred?(params[:pressed])

        unless button_has_redirect_suffix?(params[:pressed])
          set_refresh_and_show
        end
      end
    else
      set_default_refresh_div

      case params[:pressed]
      when "resource_pool_delete"
        deleteresourcepools
        if !@flash_array.nil? && @single_delete
          javascript_redirect :action => 'show_list', :flash_msg => @flash_array[0][:message] # redirect to build the retire screen
        end
      when "resource_pool_tag"
        tag(ResourcePool)
        return if @flash_array.nil?
      when "resource_pool_protect"
        assign_policies(ResourcePool)
        return if @flash_array.nil?
      end
    end

    check_if_button_is_implemented

    if button_has_redirect_suffix?(params[:pressed])
      render_or_redirect_partial_for(params[:pressed])
    elsif button_replace_gtl_main?
      replace_gtl_main_div
    else
      render_flash
    end
  end

  private

  def textual_group_list
    [%i(properties relationships), %i(configuration smart_management)]
  end
  helper_method :textual_group_list

  def button_sub_item_display_values
    %w(all_vms vms resource_pools)
  end

  menu_section :inf
end
