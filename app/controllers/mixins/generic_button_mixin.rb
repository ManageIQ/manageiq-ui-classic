module Mixins
  module GenericButtonMixin
    # handle buttons pressed on the button bar

    def handle_vm_buttons(pressed)
      return [:not_started, nil] unless vm_style_button?(pressed)

      pfx = pfx_for_vm_button_pressed(pressed)
      process_vm_buttons(pfx)

      # Control transferred to another screen, so return
      return [:finished, pfx] if vm_button_redirected?(pfx, pressed)

      unless ["#{pfx}_edit", "#{pfx}_miq_request_new", "#{pfx}_clone",
              "#{pfx}_migrate", "#{pfx}_publish"].include?(pressed)
        @refresh_div = "main_div"
        @refresh_partial = "layouts/gtl"
        show # Handle VMs buttons
      end
      [:continue, pfx]
    end

    def handle_tag_buttons(pressed)
      case pressed
      when "#{self.class.table_name}_tag"  then tag(self.class.model)
      when 'cloud_network_tag'             then tag(CloudNetwork)
      when 'cloud_object_store_object_tag' then tag(CloudObjectStoreObject)
      when 'cloud_subnet_tag'              then tag(CloudSubnet)
      when 'cloud_tenant_tag'              then tag(CloudTenant)
      when 'cloud_volume_snapshot_tag'     then tag(CloudVolumeSnapshot)
      when 'cloud_volume_tag'              then tag(CloudVolume)
      when 'floating_ip_tag'               then tag(FloatingIp)
      when 'load_balancer_tag'             then tag(LoadBalancer)
      when 'network_port_tag'              then tag(NetworkPort)
      when 'network_router_tag'            then tag(NetworkRouter)
      when 'security_group_tag'            then tag(SecurityGroup)
      end

      @flash_array.nil? ? :finished : :continue
    end

    def button
      @edit = session[:edit] # Restore @edit for adv search box
      params[:display] = @display if %w(vms images instances).include?(@display)
      params[:page] = @current_page unless @current_page.nil? # Save current page for list refresh

      if params[:pressed] == "custom_button"
        custom_buttons
        return
      end

      handle_status = :not_started
      # Handle vm-style buttons if included in the controller
      if respond_to?(:process_vm_buttons, true)
        handle_status, pfx = handle_vm_buttons(params[:pressed])
        return if handle_status == :finished
      end

      # Handle tag buttons if tagging supported by the controller
      if handle_status == :not_started &&
         respond_to?(:tag, true) && params[:pressed].ends_with?("_tag")

        handle_status = handle_tag_buttons(params[:pressed])
        return if handle_status == :finished
      end

      if handle_status == :not_started &&
         respond_to?(:specific_buttons, true)

        handled = specific_buttons(params[:pressed])
        return if handled
      end

      check_if_button_is_implemented

      if params[:pressed].ends_with?("_edit") || ["#{pfx}_miq_request_new", "#{pfx}_clone",
                                                  "#{pfx}_migrate", "#{pfx}_publish"].include?(params[:pressed])
        render_or_redirect_partial(pfx)
      elsif @refresh_div == "main_div" && @lastaction == "show_list"
        replace_gtl_main_div
      else
        render_flash
      end
    end
  end
end
