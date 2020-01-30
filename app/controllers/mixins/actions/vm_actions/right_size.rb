module Mixins
  module Actions
    module VmActions
      module RightSize
        def vm_right_size
          assert_privileges(params[:pressed])
          # check to see if coming from show_list or drilled into vms from another CI
          rec_cls = "vm"
          record = find_record_with_rbac(VmOrTemplate, checked_or_params)
          if record.nil?
            add_flash(_("One %{model} must be selected to Right-Size Recommendations") %
              {:model => ui_lookup(:table => request.parameters[:controller])}, :error)
            @refresh_div = "flash_msg_div"
            @refresh_partial = "layouts/flash_msg"
            return
          elsif record.template?
            add_flash(_("Right-Size Recommendations does not apply to selected VM Template"), :error)
            javascript_flash(:scroll_top => true)
            return
          end
          if @explorer
            @refresh_partial = "vm_common/right_size"
            right_size(record)
            replace_right_cell if @orig_action == "x_history"
          elsif role_allows?(:feature => "vm_right_size")
            # redirect to build the ownership screen
            javascript_redirect(:controller => rec_cls.to_s, :action => 'right_size', :id => record.id, :escape => false)
          else
            head :ok
          end
        end

        alias instance_right_size vm_right_size
      end
    end
  end
end
