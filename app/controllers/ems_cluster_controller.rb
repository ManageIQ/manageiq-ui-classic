class EmsClusterController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericButtonMixin

  def drift_history
    @display = "drift_history"
    super
  end

  def show
    return if perfmenu_click?
    @display = params[:display] || "main" unless pagination_or_gtl_request?

    @lastaction = "show"
    @showtype = "config"
    @ems_cluster = @record = identify_record(params[:id])
    return if record_no_longer_exists?(@ems_cluster)

    @gtl_url = "/show"

    case @display
    when "main", "summary_only"
      get_tagdata(@ems_cluster)
      drop_breadcrumb({:name => _("Clusters"), :url => "/ems_cluster/show_list?page=#{@current_page}&refresh=y"}, true)
      drop_breadcrumb(:name => @ems_cluster.name + _(" (Summary)"), :url => "/ems_cluster/show/#{@ems_cluster.id}")
      @showtype = "main"
      set_summary_pdf_data if @display == "summary_only"

    when "descendant_vms"
      drop_breadcrumb(:name => @ems_cluster.name + _(" (All VMs - Tree View)"),
                      :url  => "/ems_cluster/show/#{@ems_cluster.id}?display=descendant_vms&treestate=true")
      @showtype = "config"

      cluster = @ems_cluster
      @datacenter_tree = TreeBuilderDatacenter.new(:datacenter_tree, :datacenter, @sb, true, cluster)
      self.x_active_tree = :datacenter_tree

    when "all_vms"
      drop_breadcrumb(:name => @ems_cluster.name + _(" (All VMs)"),
                      :url  => "/ems_cluster/show/#{@ems_cluster.id}?display=all_vms")
      @view, @pages = get_view(Vm, :parent => @ems_cluster, :association => "all_vms")  # Get the records (into a view) and the paginator
      @showtype = "vms"

    when "miq_templates", "vms"
      title, kls = @display == "vms" ? ["VMs", Vm] : ["Templates", MiqTemplate]
      drop_breadcrumb(:name => @ems_cluster.name + _(" (Direct %{title})") % {:title => title},
                      :url  => "/ems_cluster/show/#{@ems_cluster.id}?display=#{@display}")
      @view, @pages = get_view(kls, :parent => @ems_cluster)  # Get the records (into a view) and the paginator
      @showtype = @display

    when "hosts"
      label, condition, breadcrumb_suffix = hosts_subsets

      drop_breadcrumb(:name => label, :url => "/ems_cluster/show/#{@ems_cluster.id}?display=hosts#{breadcrumb_suffix}")
      @view, @pages = get_view(Host, :parent => @ems_cluster, :conditions => condition) # Get the records (into a view) and the paginator
      @showtype = "hosts"

    when "resource_pools"
      drop_breadcrumb(:name => @ems_cluster.name + _(" (All Resource Pools)"),
                      :url  => "/ems_cluster/show/#{@ems_cluster.id}?display=resource_pools")
      @view, @pages = get_view(ResourcePool, :parent => @ems_cluster) # Get the records (into a view) and the paginator
      @showtype = "resource_pools"

    when "config_info"
      @showtype = "config"
      drop_breadcrumb(:name => _("Configuration"), :url => "/ems_cluster/show/#{@ems_cluster.id}?display=#{@display}")

    when "performance"
      @showtype = "performance"
      drop_breadcrumb(:name => _("%{name} Capacity & Utilization") % {:name => @ems_cluster.name},
                      :url  => "/ems_cluster/show/#{@ems_cluster.id}?display=#{@display}&refresh=n")
      perf_gen_init_options               # Intialize perf chart options, charts will be generated async

    when "timeline"
      @showtype = "timeline"
      session[:tl_record_id] = params[:id] if params[:id]
      @record = find_by_id_filtered(EmsCluster, session[:tl_record_id])
      @timeline = @timeline_filter = true
      @lastaction = "show_timeline"
      tl_build_timeline                       # Create the timeline report
      drop_breadcrumb(:name => _("Timelines"), :url => "/ems_cluster/show/#{@record.id}?refresh=n&display=timeline")

    when "storage"
      drop_breadcrumb(:name => @ems_cluster.name + _(" (All Descendant %{table}(s))") %
        {:table => ui_lookup(:table => "storages")},
                      :url  => "/ems_cluster/show/#{@ems_cluster.id}?display=storage")
      @view, @pages = get_view(Storage, :parent => @ems_cluster)  # Get the records (into a view) and the paginator
      @showtype = "storage"
    end

    set_config(@ems_cluster)
    session[:tl_record_id] = @record.id

    replace_gtl_main_div if pagination_request?
  end

  # handle buttons pressed on the button bar
  def button
    restore_edit_for_search
    copy_sub_item_display_value_to_params

    # Handle buttons from sub-items screen
    handle_sub_item_presses(params[:pressed]) do |pfx|
      case params[:pressed]
      when "host_analyze_check_compliance" then analyze_check_compliance_hosts
      when "host_check_compliance"         then check_compliance_hosts
      when "host_compare"                  then comparemiq
      when "host_delete"                   then deletehosts
      when "host_edit"                     then edit_record
      when "host_protect"                  then assign_policies(Host)
      when "host_refresh"                  then refreshhosts
      when "host_scan"                     then scanhosts
      when "host_tag"                      then tag(Host)
      when "rp_tag"                        then tag(ResourcePool)
      end

      # Handle Host power buttons
      if button_power_press?(params[:pressed])
        handle_host_power_press(params[:pressed])
      else
        process_vm_buttons(pfx)
        return if button_control_transferred?(params[:pressed])

        unless button_has_redirect_suffix?(params[:pressed])
          set_refresh_and_show
        end
      end
    end

    unless params[:pressed].starts_with?(*button_sub_item_prefixes)
      set_default_refresh_div

      case params[:pressed]
      when "common_drift"        then drift_analysis
      when "ems_cluster_compare" then comparemiq
      when "ems_cluster_protect" then assign_policies(EmsCluster)
      when "ems_cluster_scan"    then scanclusters
      when "ems_cluster_tag"     then tag(EmsCluster)
      when "custom_button"
        custom_buttons
        return # let custom_buttons method handle everything
      when "ems_cluster_delete"
        deleteclusters

        if @flash_array.present? && @single_delete
          javascript_redirect :action => 'show_list', :flash_msg => @flash_array[0][:message]
        end
      when "ems_cluster_tag", "ems_cluster_compare", "common_drift", "ems_cluster_protect"
        if @flash_array.nil?
          return # Tag screen showing, so return
        end
      end
    end

    if button_not_handled?
      add_flash(_("Button not yet implemented"), :error)
    elsif lastaction_is_show_and_flash_present?
      @ems_cluster = @record = identify_record(params[:id])
    end

    @refresh_partial = "layouts/flash_msg"
    @refresh_div = "flash_msg_div"

    if button_has_redirect_suffix?(params[:pressed])
      render_or_redirect_partial(button_prefix(params[:pressed]))
    else
      if @refresh_div == "main_div" && @lastaction == "show_list"
        replace_gtl_main_div
      else
        render_flash
      end
    end
  end

  private

  def textual_group_list
    [
      %i(relationships),
      %i(host_totals vm_totals configuration tags openstack_status)
    ]
  end
  helper_method :textual_group_list

  def hosts_subsets
    condition         = nil
    label             = _("%{name} (All %{titles})" % {:name => @ems_cluster.name, :titles => title_for_hosts})
    breadcrumb_suffix = ""

    host_service_group_name = params[:host_service_group_name]
    if host_service_group_name
      case params[:status]
      when 'running'
        hosts_filter =  @ems_cluster.host_ids_with_running_service_group(host_service_group_name)
        label        = _("Hosts with running %{name}") % {:name => host_service_group_name}
      when 'failed'
        hosts_filter =  @ems_cluster.host_ids_with_failed_service_group(host_service_group_name)
        label        = _("Hosts with failed %{name}") % {:name => host_service_group_name}
      when 'all'
        hosts_filter = @ems_cluster.host_ids_with_service_group(host_service_group_name)
        label        = _("All %{titles} with %{name}") % {:titles => title_for_hosts, :name => host_service_group_name}
      end

      if hosts_filter
        condition = ["hosts.id IN (#{hosts_filter.to_sql})"]
        breadcrumb_suffix = "&host_service_group_name=#{host_service_group_name}&status=#{params[:status]}"
      end
    end

    return label, condition, breadcrumb_suffix
  end

  def breadcrumb_name(_model)
    title_for_clusters
  end

  def set_config(db_record)
    @cluster_config = []
    @cluster_config.push(:field       => "HA Enabled",
                         :description => db_record.ha_enabled) unless db_record.ha_enabled.nil?
    @cluster_config.push(:field       => "HA Admit Control",
                         :description => db_record.ha_admit_control) unless db_record.ha_admit_control.nil?
    @cluster_config.push(:field       => "DRS Enabled",
                         :description => db_record.drs_enabled) unless db_record.drs_enabled.nil?
    @cluster_config.push(:field       => "DRS Automation Level",
                         :description => db_record.drs_automation_level) unless db_record.drs_automation_level.nil?
    @cluster_config.push(:field       => "DRS Migration Threshold",
                         :description => db_record.drs_migration_threshold) unless db_record.drs_migration_threshold.nil?
  end

  def get_session_data
    @title      = _("Clusters")
    @layout     = "ems_cluster"
    @lastaction = session[:ems_cluster_lastaction]
    @display    = session[:ems_cluster_display]
    @filters    = session[:ems_cluster_filters]
    @catinfo    = session[:ems_cluster_catinfo]
  end

  def set_session_data
    session[:ems_cluster_lastaction] = @lastaction
    session[:ems_cluster_display]    = @display unless @display.nil?
    session[:ems_cluster_filters]    = @filters
    session[:ems_cluster_catinfo]    = @catinfo
  end

  # Overrides generic button value
  def button_sub_item_display_values
    ["all_vms", "vms", "hosts", "resource_pools"]
  end

  def button_sub_item_prefixes
    ["vm_", "miq_template_", "guest_", "host_", "rp_"]
  end

  menu_section :inf
end
