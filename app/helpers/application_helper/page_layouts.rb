module ApplicationHelper::PageLayouts
  def layout_uses_listnav?
    return false if action_name == "show"
    return false if show_list_with_no_provider?

    return false if show_list_ansible?

    return false if @in_a_form

    return false if %w[
      about
      all_tasks
      chargeback
      chargeback_rate
      configuration
      container_dashboard
      container_topology
      ems_infra_dashboard
      infra_topology
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
      physical_infra_overview
      physical_infra_topology
      physical_network_port
      pxe
      report
      server_build
      storage
      storage_pod
    ].include?(@layout)

    return false if %w[
      ad_hoc_metrics
      consumption
      dashboard
      dialog_provision
      topology
    ].include?(@showtype)

    return false if dashboard_no_listnav?

    return false if @layout.starts_with?("miq_request")

    return false if controller.action_name.end_with?("tagging_edit")

    true
  end

  def show_list_ansible?
    %w[
      ansible_credential
      ansible_playbook
      ansible_repository
    ].include?(controller_name) &&
      action_name == 'show_list'
  end

  def show_list_with_no_provider?
    %w[
      automation_manager
      ems_cloud
      ems_container
      ems_infra
      ems_network
      ems_physical_infra
    ].include?(controller_name) &&
      action_name == 'show_list' &&
      controller.class.model.none?
  end

  def layout_uses_paging?
    # listnav always implies paging, this only handles the non-listnav case
    %w[
      all_tasks
      miq_request_ae
      miq_request_host
      miq_request_vm
      my_tasks
    ].include?(@layout) && params[:action] != 'show'
  end

  def layout_uses_tabs?
    return false if %w[login authenticate auth_error].include?(controller.action_name)

    layout = case @layout
             when 'container_dashboard', 'dashboard', 'ems_infra_dashboard', 'exception', 'physical_infra_overview',
                  'monitor_alerts_list', 'monitor_alerts_most_recent', 'monitor_alerts_overview'
               false
             when 'report'
               !%w[new create edit copy update explorer].include?(controller.action_name)
             when 'timeline'
               @in_a_form
             when 'vm'
               controller.action_name != 'edit'
             else
               true
             end

    showtype = case @showtype
               when 'dashboard'
                 @in_a_form ? true : !@lastaction.to_s.ends_with?("_dashboard")
               when 'topology'
                 false
               else
                 true
               end

    layout && showtype
  end

  def dashboard_no_listnav?
    @layout == "dashboard" && %w[
      auth_error
      change_tab
      show
    ].include?(controller.action_name)
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
          params[:controller] == "utilization"
      end
  end

  def simulate?
    @simulate ||=
      begin
        rsop = controller.controller_name == 'miq_policy' && controller.action_name == 'rsop'
        resolve = controller.controller_name == 'miq_ae_tools' && controller.action_name == 'resolve'
        rsop || resolve
      end
  end

  def saved_report_paging?
    # saved report doesn't use miq_report object,
    # need to use a different paging view to page thru a saved report
    @sb[:pages] && @html && %i[reports_tree savedreports_tree cb_reports_tree].include?(x_active_tree)
  end

  def show_search?
    # Layouts with Advanced Search have the Search, too
    controller.try(:show_searchbar?) || display_adv_search?
  end

  def show_advanced_search?
    x_tree && ((tree_with_advanced_search? && !@record) || @show_adv_search)
  end

  def show_adv_search?
    show_search = %w[
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
      cloud_volume_type
      configuration_job
      configured_system
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
      ems_configuration
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
      middleware_deployment
      middleware_domain
      middleware_server
      miq_template
      network_port
      network_router
      network_service
      network_service_entry
      offline
      orchestration_stack
      persistent_volume
      physical_server
      resource_pool
      retired
      security_group
      security_policy
      security_policy_rule
      service
      templates
      vm
    ]

    (@lastaction == "show_list" && !session[:menu_click] && show_search.include?(@layout) && !@in_a_form) ||
      (@explorer && x_tree && tree_with_advanced_search? && !@record)
  end

  attr_reader :big_iframe

  # a layout which gives full control over the center, but always provides the navbars and menus - to be overriden per-controller, used by v2v
  def layout_full_center
    nil
  end
end
