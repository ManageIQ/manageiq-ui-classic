module ApplicationHelper::PageLayouts
  def layout_uses_listnav?
    return false if @in_a_form
    return false if %w(
      about
      all_tasks
      chargeback
      configuration
      container_dashboard
      container_topology
      ems_infra_dashboard
      infra_topology
      middleware_topology
      network_topology
      cloud_topology
      diagnostics
      exception
      miq_ae_automate_button
      miq_ae_customization
      miq_ae_export
      miq_ae_logs
      miq_ae_tools
      miq_policy
      miq_policy_export
      miq_policy_logs
      monitor_alerts_overview
      monitor_alerts_list
      monitor_alerts_most_recent
      my_tasks
      ops
      physical_infra_topology
      pxe
      report
      rss
      server_build
      storage
      storage_pod
    ).include?(@layout)

    return false if %w(
      ad_hoc_metrics
      consumption
      dashboard
      dialog_provision
      topology
    ).include?(@showtype)

    return false if dashboard_no_listnav?

    return false if @layout.starts_with?("miq_request")

    return false if controller.action_name.end_with?("tagging_edit")

    true
  end

  def layout_uses_paging?
    # listnav always implies paging, this only handles the non-listnav case
    %w(
      all_tasks
      miq_request_ae
      miq_request_host
      miq_request_service
      miq_request_vm
      my_tasks
    ).include?(@layout) && params[:action] != 'show'
  end

  def layout_uses_tabs?
    if (["timeline"].include?(@layout) && ! @in_a_form) ||
       ["login", "authenticate", "auth_error"].include?(controller.action_name) ||
       @layout == "exception" ||
       (@layout == 'vm' && controller.action_name == 'edit') ||
       (@layout == "report" && ["new", "create", "edit", "copy", "update", "explorer"].include?(controller.action_name))
      return false
    elsif %w(container_dashboard dashboard ems_infra_dashboard).include?(@layout) ||
          (%w(dashboard).include?(@showtype) && @lastaction.ends_with?("_dashboard")) ||
          %w(topology).include?(@showtype)
      # Dashboard tabs are located in taskbar because they are otherwise hidden behind the taskbar regardless of z-index
      return false
    elsif @layout == "monitor_alerts_overview" ||
          @layout == "monitor_alerts_list" ||
          @layout == "monitor_alerts_most_recent"
      return false
    end
    true
  end

  def layout_uses_breadcrumbs?
    !["dashboard",
      "exception",
      "support",
      "configuration",
      "rss"].include?(@layout)
  end

  def dashboard_no_listnav?
    @layout == "dashboard" && %w(
      auth_error
      change_tab
      show
    ).include?(controller.action_name)
  end

  def center_div_partial
    if layout_uses_listnav?
      "layouts/center_div_with_listnav"
    elsif dashboard_no_listnav?
      "layouts/center_div_dashboard_no_listnav"
    else
      "layouts/center_div_no_listnav"
    end
  end

  def inner_layout_present?
    @inner_layout_present ||=
      begin
        @explorer || params[:action] == "explorer" ||
          (params[:controller] == "chargeback" && params[:action] == "chargeback") ||
          (params[:controller] == "miq_ae_tools" && (params[:action] == "resolve" || params[:action] == "show")) ||
          (params[:controller] == "miq_policy" && params[:action] == "rsop") ||
          (params[:controller] == "utilization" || params[:controller] == "planning" || params[:controller] == "bottlenecks")
      end
  end

  def simulate?
    @simulate ||=
      begin
        rsop = controller.controller_name == 'miq_policy' && controller.action_name == 'rsop'
        resolve = controller.controller_name == 'miq_ae_tools' && controller.action_name == 'resolve'
        planning = controller.controller_name == 'planning'
        rsop || resolve || planning
      end
  end

  def saved_report_paging?
    # saved report doesn't use miq_report object,
    # need to use a different paging view to page thru a saved report
    @sb[:pages] && @html && [:reports_tree, :savedreports_tree, :cb_reports_tree].include?(x_active_tree)
  end

  def show_advanced_search?
    x_tree && ((tree_with_advanced_search? && !@record) || @show_adv_search)
  end

  def show_adv_search?
    show_search = %w(
      auth_key_pair_cloud
      availability_zone
      automation_manager
      cloud_network
      cloud_object_store_container
      cloud_object_store_object
      cloud_subnet
      cloud_tenant
      cloud_volume
      cloud_volume_backup
      cloud_volume_snapshot
      configuration_job
      container
      container_build
      container_group
      container_image
      container_image_registry
      container_node
      container_project
      container_replicator
      container_route
      container_service
      container_template
      ems_cloud
      ems_cluster
      ems_container
      ems_infra
      ems_middleware
      ems_network
      ems_physical_infra
      ems_storage
      flavor
      floating_ip
      generic_object_definition
      host
      host_aggregate
      load_balancer
      middleware_datasource
      middleware_deployment
      middleware_domain
      middleware_messaging
      middleware_server
      miq_template
      network_port
      network_router
      offline
      orchestration_stack
      persistent_volume
      physical_server
      provider_foreman
      resource_pool
      retired
      security_group
      service
      templates
      vm
    )

    (@lastaction == "show_list" && !session[:menu_click] && show_search.include?(@layout) && !@in_a_form) ||
      (@explorer && x_tree && tree_with_advanced_search? && !@record)
  end
end
