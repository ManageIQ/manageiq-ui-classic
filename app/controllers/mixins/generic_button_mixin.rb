module Mixins
  module GenericButtonMixin
    def button
      generic_button_setup

      handle_button_pressed(params[:pressed]) do |pressed|
        return if pressed.ends_with?("tag") && @flash_array.nil?
        return if performed? # did something build a response?
      end

      handle_sub_item_presses(params[:pressed]) do |pfx|
        process_vm_buttons(pfx)
        return if button_control_transferred?(params[:pressed])

        unless button_has_redirect_suffix?(params[:pressed])
          set_refresh_and_show
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

    # This send is white-listed by `handled_buttons`
    def button_handler_dispatch(pressed)
      if table_name_tag?(pressed)
        handle_model_tag
      else
        send("handle_#{pressed}".to_sym)
      end
    end

    # Ideal method to use
    def handle_button_pressed(pressed)
      if button_power_press?(pressed)
        powerbutton_hosts(button_remove_prefix(pressed))
      elsif handled_buttons.include?(pressed)
        button_handler_dispatch(pressed)

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

    def table_name_tag?(pressed)
      defined?(self.class.model) && pressed == table_name_tag
    end

    def table_name_tag
      "#{self.class.table_name}_tag"
    end

    def handle_model_tag
      tag(self.class.model)
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
        host_tag
        host_toggle_maintenance
      )
    end

    def handled_storage_buttons
      %w(storage_scan storage_refresh storage_delete storage_tag)
    end

    def handled_ems_cluster_buttons
      %w(ems_cluster_compare ems_cluster_delete ems_cluster_protect ems_cluster_scan)
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
        "ems_cluster_tag",
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

    def handle_host_tag
      tag(Host)
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

    def handle_storage_tag
      tag(Storage)
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
      %w(_edit _copy _miq_request_new _clone _migrate _publish)
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

    # Should be overwridden in controller
    # By default handle controller.table_name tag
    def handled_buttons
      [table_name_tag]
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

    def js_redirect_to_edit_for_checked_id
      javascript_redirect :action => "edit", :id => checked_item_id
    end

    def js_redirect_to_new
      javascript_redirect :action => "new"
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
        javascript_redirect :action      => 'show_list',
                            :flash_msg   => @flash_array[0][:message],
                            :flash_error => @flash_array[0][:level] == :error
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
