module Mixins
  module Actions
    module VmActions
      module RightSize
        def vm_right_size
          assert_privileges(params[:pressed])
          # check to see if coming from show_list or drilled into vms from another CI
          rec_cls = "vm"
          recs = params[:display] ? find_checked_ids_with_rbac(VmOrTemplate) : [find_id_with_rbac(VmOrTemplate, params[:id]).to_i]
          if recs.length < 1
            add_flash(_("One or more %{model} must be selected to Right-Size Recommendations") %
              {:model => ui_lookup(:table => request.parameters[:controller])}, :error)
            @refresh_div = "flash_msg_div"
            @refresh_partial = "layouts/flash_msg"
            return
          else
            if VmOrTemplate.includes_template?(recs)
              add_flash(_("Right-Size Recommendations does not apply to selected %{model}") %
                {:model => ui_lookup(:table => "miq_template")}, :error)
              javascript_flash(:scroll_top => true)
              return
            end
          end
          if @explorer
            @refresh_partial = "vm_common/right_size"
            right_size
            replace_right_cell if @orig_action == "x_history"
          else
            if role_allows?(:feature => "vm_right_size")
              javascript_redirect :controller => rec_cls.to_s, :action => 'right_size', :id => recs[0], :escape => false # redirect to build the ownership screen
            else
              head :ok
            end
          end
        end

        alias_method :instance_right_size, :vm_right_size
      end
    end
  end
end
