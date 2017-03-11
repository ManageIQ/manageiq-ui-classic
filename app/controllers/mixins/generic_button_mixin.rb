
module Mixins
  # NOTE: ivars and estimated purpose
  # @current_page
  # @display
  # @edit
  # @flash_array
  # @lastaction
  # @redirect_id
  # @refresh_div
  # @refresh_partial

  # TODO: consider moving related methods here
  # ==== ApplicationController
  # render_or_redirect_partial
  #
  # ==== ApplicationController::Buttons
  # custom_buttons
  #
  # ==== ApplicationHelper
  # check_if_button_is_implemented
  #
  # ==== CiProcessing
  # process_vm_buttons => moved
  # pfx_for_vm_button_pressed
  # POWER_BUTTON_NAMES
  # powerbutton_hosts
  # host_button_operation

  # NOTE: Methods that eventually call render
  # javascript_redirect
  # javascript_flash

  # NOTE: Press values encountered
  # auth_key_pair_cloud_tag
  # auth_key_pair_cloud_delete
  # auth_key_pair_cloud_new
  # availability_zone_tag
  # cloud_network_tag
  # cloud_network_delete
  # cloud_network_edit
  # cloud_network_new
  # cloud_object_store_container_tag
  # cloud_object_store_object_tag
  # cloud_subnet_tag
  # cloud_subnet_delete
  # cloud_subnet_edit
  # cloud_subnet_new
  # cloud_tenant_new
  # cloud_tenant_edit
  # cloud_tenant_delete
  # custom_button
  # cloud_volume_tag
  # cloud_volume_delete
  # cloud_volume_attach
  # cloud_volume_detach
  # cloud_volume_edit
  # cloud_volume_snapshot_create
  # cloud_volume_new
  # cloud_volume_backup_create
  # cloud_volume_backup_restore
  #
  # host_analyze_check_compliance
  # host_check_compliance
  # host_cloud_service_scheduling_toggle
  # host_compare
  # host_delete
  # host_edit
  # host_introspect
  # host_manageable
  # host_miq_request_new
  # host_protect
  # host_provide
  # host_refresh
  # host_scan
  # host_toggle_maintenance
  # storage_scan
  # storage_refresh
  # storage_delete
  # ems_cluster_compare
  # ems_cluster_delete
  # ems_cluster_protect
  # ems_cluster_scan
  #
  #
  module GenericButtonMixin
    # handle buttons pressed on the button bar
    # TODO: break this up and include only relevant methods in controllers
    #
    def button
      generic_button_setup

      handle_sub_item_presses(params[:pressed]) do |pfx|
        process_vm_buttons(pfx)
        return if button_control_transferred?(params[:pressed])

        unless button_has_redirect_suffix?(params[:pressed])
          set_refresh_and_show
        end
      end

      handle_tag_presses(params[:pressed]) do
        return if @flash_array.nil?
      end

      if respond_to?(:specific_buttons, true)
        handled = specific_buttons(params[:pressed])
        return if handled
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

    ### Button setup
    ############################################################################

    def restore_edit_for_search
      @edit = session[:edit]
    end

    def save_current_page_for_refresh
      params[:page] = @current_page unless @current_page.nil?
    end

    def set_display_param
      params[:display] = @display
    end

    # Displaying sub-items
    def copy_sub_item_display_value_to_params
      if button_sub_item_display_values.include?(@display)
        set_display_param
      end
    end

    def generic_button_setup
      restore_edit_for_search
      copy_sub_item_display_value_to_params
      save_current_page_for_refresh
      set_default_refresh_div
    end

    ### Dispatch to handlers
    ############################################################################

    # Ideal method to use
    # This send is white-listed by `handled_buttons`
    def handle_button_pressed(pressed)
      if handled_buttons.include?(pressed)
        send("handle_#{pressed}".to_sym)

        yield(pressed) if block_given?
      end
    end

    # Handle buttons from sub-item (unrelated to this controller) screens
    def handle_sub_item_presses(pressed)
      if pressed.starts_with?(*button_sub_item_prefixes)
        pfx = button_prefix(params[:pressed])

        yield(pfx) if block_given?
      end
    end

    def handle_tag_presses(pressed)
      if pressed.ends_with?("_tag")
        tag_for_pressed(pressed)

        yield(pressed) if block_given?
      end
    end

    def handle_host_power_press(pressed)
      if button_power_press?(params[:pressed])
        powerbutton_hosts(button_remove_prefix(pressed))
      end
    end

    def tag_for_pressed(pressed)
      case pressed
      when "#{self.class.table_name}_tag"     then tag(self.class.model)
      when "availability_zone_tag"            then tag(AvailabilityZone)
      when "cloud_network_tag"                then tag(CloudNetwork)
      when "cloud_object_store_container_tag" then tag(CloudObjectStoreContainer)
      when "cloud_subnet_tag"                 then tag(CloudSubnet)
      when "cloud_tenant_tag"                 then tag(CloudTenant)
      when "cloud_volume_snapshot_tag"        then tag(CloudVolumeSnapshot)
      when "cloud_volume_tag"                 then tag(CloudVolume)
      when "ems_cluster_tag"                  then tag(EmsCluster)
      when "flavor_tag"                       then tag(Flavor)
      when "floating_ip_tag"                  then tag(FloatingIp)
      when "host_tag"                         then tag(Host)
      when "infra_networking_tag"             then tag(Switch)
      when "load_balancer_tag"                then tag(LoadBalancer)
      when "network_port_tag"                 then tag(NetworkPort)
      when "network_router_tag"               then tag(NetworkRouter)
      when "orchestration_stack_tag"          then tag(OrchestrationStack)
      when "security_group_tag"               then tag(SecurityGroup)
      when "storage_tag"                      then tag(Storage)
      when "miq_template_tag", "vm_tag", "instance_tag"
        tag(VmOrTemplate)
      end
    end

    ### Common handlers
    ############################################################################

    def handled_host_buttons
      %w(
        host_analyze_check_compliance
        host_check_compliance
        host_cloud_service_scheduling_toggle
        host_compare
        host_delete
        host_edit
        host_introspect
        host_manageable
        host_miq_request_new
        host_protect
        host_provide
        host_refresh
        host_scan
        host_toggle_maintenance
      )
    end

    def handled_storage_buttons
      %w(
        storage_scan
        storage_refresh
        storage_delete
      )
    end

    def handled_ems_cluster_buttons
      %w(
        ems_cluster_compare
        ems_cluster_delete
        ems_cluster_protect
        ems_cluster_scan
      )
    end

    # Used in Middleware-related controllers that include EmsCommon
    def middleware_handled_buttons
      [
        "host_aggregate_edit",
        "cloud_tenant_edit",
        "cloud_volume_edit",
        "custom_button",
        "ems_cluster_compare",
        "ems_cluster_delete",
        "ems_cluster_scan",
        handled_host_buttons,
        handled_storage_buttons
      ].flatten
    end

    def handle_custom_button
      custom_buttons
    end

    def handle_instance_retire
      retirevms
    end

    def handle_host_analyze_check_compliance
      analyze_check_compliance_hosts
    end

    def handle_host_check_compliance
      check_compliance_hosts
    end

    def handle_host_compare
      comparemiq
    end

    def handle_host_delete
      deletehosts
      redirect_to_retire_screen_if_single_delete
    end

    def handle_host_edit
      edit_record
    end

    def handle_host_protect
      assign_policies(Host)
    end

    def handle_host_refresh
      refreshhosts
    end

    def handle_host_scan
      scanhosts
    end

    def handle_host_cloud_service_scheduling_toggle
      toggleservicescheduling
    end

    def handle_host_introspect
      introspecthosts
    end

    def handle_host_manageable
      sethoststomanageable
    end

    def handle_host_provide
      providehosts
    end

    def handle_host_toggle_maintenance
      maintenancehosts
    end

    def handle_host_miq_request_new
      prov_redirect

      if @lastaction == "show"
        @host = @record = identify_record(params[:id])
      end
    end

    # Storage

    def handle_storage_scan
      scanstorage
    end

    def handle_storage_refresh
      refreshstorage
    end

    def handle_storage_delete
      deletestorages
    end

    # Ems Clusters

    def handle_ems_cluster_compare
      comparemiq
    end

    def handle_ems_cluster_delete
      deleteclusters
    end

    def handle_ems_cluster_protect
      assign_policies(EmsCluster)
    end

    def handle_ems_cluster_scan
      scanclusters
    end

    ### Predicates
    ############################################################################

    def button_power_press?(pressed)
      pressed.ends_with?(*button_power_suffixes)
    end

    def button_skip_show_render?(pressed)
      # pfx = button_prefix(pressed)
      suffixes = %w(
        _edit
        _miq_request_new
        _clone
        _migrate
        _publish
      )

      pressed.ends_with?(*suffixes)
    end

    def button_has_redirect_suffix?(pressed)
      pressed.ends_with?(*button_redirect_suffixes)
    end

    def button_replace_gtl_main?
      @refresh_div == "main_div" && @lastaction == "show_list"
    end

    # if no button handler ran, show not implemented msg
    def button_not_handled?
      !@refresh_partial && @flash_array.nil?
    end

    def lastaction_is_show_and_flash_present?
      @flash_array && @lastaction == "show"
    end

    # Control transferred to another screen
    # (Also) # Some other screen is showing, so return
    def button_control_transferred?(pressed)
      pressed.ends_with?(*button_control_transfer_suffixes) && @flash_array.nil?
    end

    def refreshing_flash_msg?
      @refresh_div == "flash_msg_div"
    end

    ### Prefixes
    ############################################################################

    def button_sub_item_prefixes
      %w(
        guest_
        host_
        image_
        instance_
        miq_template_
        rp_
        vm_
      )
    end

    def button_prefix(pressed)
      @button_pfx ||= pfx_for_vm_button_pressed(pressed)
    end

    def button_remove_prefix(pressed)
      pressed.split("_")[1..-1].join("_")
    end

    ### Suffixes
    ############################################################################

    def button_redirect_suffixes
      %w(
        _edit
        _copy
        _miq_request_new
        _clone
        _migrate
        _publish
      )
    end

    def button_control_transfer_suffixes
      %w(
        _compare
        _drift
        _evacuate
        _live_migrate
        _ownership
        _policy_sim
        _protect
        _reconfigure
        _refresh
        _reload
        _resize
        _retire
        _right_size
        _scan
        _tag
      )
    end

    def button_power_suffixes
      %w(
        _shutdown
        _reboot
        _standby
        _enter_maint_mode
        _exit_maint_mode
        _start
        _stop
        _reset
      )
    end

    ### Other arrays of magic strings
    ############################################################################

    def button_sub_item_display_values
      %w(all_vms vms images instances)
    end

    # Should be implemented in controller
    def handled_buttons
      []
    end

    ### Refreshes and redirects
    ############################################################################

    # Default div for button.rjs to refresh
    def set_default_refresh_div
      @refresh_div = "main_div"
    end

    def button_set_refresh
      set_default_refresh_div
      @refresh_partial = "layouts/gtl"
    end

    def set_refresh_and_show
      button_set_refresh
      show
    end

    def set_refresh_and_alert_not_implemented
      add_flash(_("Button not yet implemented"), :error)
      button_set_refresh
    end

    def render_or_redirect_partial_for(pressed)
      pfx = button_prefix(pressed)
      render_or_redirect_partial(pfx)
    end

    def button_render_fallback
      if !flash_errors? && button_replace_gtl_main?
        replace_gtl_main_div
      else
        render_flash # javascript_flash, renders json
      end
    end

    def refresh_flash_msg_or_block(page)
      if refreshing_flash_msg?
        replace_refresh_div_with_partial(page)
      elsif block_given?
        yield(page)
      end
    end

    def render_update_with_prologue
      render :update do |page|
        page << javascript_prologue
        yield(page) if block_given?
      end
    end

    def js_redirect_with_partial_and_id
      javascript_redirect :action => @refresh_partial, :id => @redirect_id
    end

    # In render :update, page is an instance of
    # ActionView::Helpers::JqueryHelper::JavascriptGenerator

    def button_center_toolbar(page)
      page << "miqSetButtons(0, 'center_tb');"
    end

    # JavascriptGenerator#replace_html replaces the contents (inside) of a div
    def replace_refresh_div_contents_with_partial(page)
      page.replace_html(@refresh_div, :partial => @refresh_partial)
    end

    # JavascriptGenerator#replace replaces an entire div itself
    def replace_refresh_div_with_partial(page)
      page.replace(@refresh_div, :partial => @refresh_partial)
    end

    def js_redirect_with_controller(options = {})
      args = {
        :controller     => @redirect_controller,
        :action         => @refresh_partial,
        :id             => @redirect_id,
        :prov_type      => @prov_type,
        :prov_id        => @prov_id,
        :org_controller => @org_controller,
        :escape         => false
      }.merge(options)

      javascript_redirect(args)
    end

    def js_redirect_with_redirect_controller_or_partial
      if @redirect_controller
        js_redirect_with_controller
      else
        js_redirect_with_partial_and_id
      end
    end

    # redirect to build the retire screen
    def redirect_to_retire_screen_if_single_delete
      if !@flash_array.nil? && @single_delete
        # javascript_redirect :action => 'show_list', :flash_msg => @flash_array[0][:message]
        javascript_redirect :action      => 'show_list',
                            :flash_msg   => @flash_array[0][:message],
                            :flash_error => @flash_array[0][:level] == :error
      end
    end

    ### Complex code moved for comparison
    ############################################################################

    # These seem to be last resorts, and seem to do similar things in different ways

    # Original
    # render :update do |page|
    #   page << javascript_prologue
    #
    #   unless @refresh_partial.nil?
    #     refresh_flash_msg_or_block(page) do |page|
    #       if ["images", "instances"].include?(@display) # If displaying vms, action_url s/b show
    #         page << "miqSetButtons(0, 'center_tb');"
    #         page.replace_html("main_div", :partial => "layouts/gtl", :locals => {:action_url => "show/#{@availability_zone.id}"})
    #       else
    #         page.replace_html(@refresh_div, :partial => @refresh_partial)
    #       end
    #     end
    #   end
    # end
    #
    # Context:
    # !button_replace_gtl_main?
    #
    def availability_zone_render_update
      render_update_with_prologue do |page|
        return if @refresh_partial.nil?

        refresh_flash_msg_or_block(page) do |pg|
          if button_sub_item_display_values.include?(@display) # If displaying vms, action_url s/b show
            button_center_toolbar(pg)
            pg.replace_html(
              "main_div",
              :partial => "layouts/gtl",
              :locals  => {
                :action_url => "show/#{@availability_zone.id}"
              }
            )
          else
            replace_refresh_div_contents_with_partial(pg)
          end
        end
      end
    end

    # Original:
    # render :update do |page|
    #   page << javascript_prologue
    #   unless @refresh_partial.nil?
    #     if refreshing_flash_msg?
    #       page.replace(@refresh_div, :partial => @refresh_partial)
    #     else
    #       page.replace_html(@refresh_div, :partial => @refresh_partial)
    #     end
    #   end
    #   page.replace_html(@refresh_div, :action => @render_action) unless @render_action.nil?
    # end
    #
    # Context:
    # !params[:pressed].ends_with?("_edit")
    def miq_request_render_update
      render_update_with_prologue do |page|
        unless @refresh_partial.nil?
          if refreshing_flash_msg?
            replace_refresh_div_with_partial(page)
          else
            replace_refresh_div_contents_with_partial(page)
          end
        end

        page.replace_html(@refresh_div, :action => @render_action) unless @render_action.nil?
      end
    end

    def storage_manager_javascript_redirect
      if button_has_redirect_suffix?(params[:pressed])
        js_redirect_with_redirect_controller_or_partial

        return
      end

      if button_replace_gtl_main?
        replace_gtl_main_div
      elsif refreshing_flash_msg?
        javascript_flash
      else
        render_update_with_prologue do |page|
          replace_refresh_div_contents_with_partial(page)
        end
      end
    end

    # def javascript_redirect(args)
    #   render :update do |page|
    #     page << javascript_prologue
    #     page.redirect_to args
    #   end
    # end

    # /GenericButtonMixin
  end
end
