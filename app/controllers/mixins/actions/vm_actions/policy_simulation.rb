module Mixins
  module Actions
    module VmActions
      module PolicySimulation
        # Policy simulation for selected entities
        # Entities supported:
        #  %w(vm miq_template instance image)

        # Most of policy simulation related stuff is in:
        # app/controllers/application_controller/policy_support.rb
        # FIXME: we'd like to unify the code layout.
        #
        def polsimvms
          assert_privileges(params[:pressed])
          vms = find_checked_ids_with_rbac(VmOrTemplate)
          if vms.blank?
            vms = [find_id_with_rbac(VmOrTemplate, params[:id])]
          end
          if vms.length < 1
            add_flash(_("At least 1 %{model} must be selected for Policy Simulation") %
              {:model => ui_lookup(:model => "Vm")}, :error)
            @refresh_div = "flash_msg_div"
            @refresh_partial = "layouts/flash_msg"
          else
            session[:tag_items] = vms       # Set the array of tag items
            session[:tag_db] = VmOrTemplate # Remember the DB
            if @explorer
              @edit ||= {}
              @edit[:explorer] = true       # Since no @edit, create @edit and save explorer to use while building url for vms in policy sim grid
              @edit[:pol_items] = vms
              session[:edit] = @edit
              policy_sim
              @refresh_partial = "layouts/policy_sim"
            else
              javascript_redirect :controller => 'vm', :action => 'policy_sim' # redirect to build the policy simulation screen
            end
          end
        end
        alias_method :image_policy_sim, :polsimvms
        alias_method :instance_policy_sim, :polsimvms
        alias_method :vm_policy_sim, :polsimvms
        alias_method :miq_template_policy_sim, :polsimvms
      end
    end
  end
end
