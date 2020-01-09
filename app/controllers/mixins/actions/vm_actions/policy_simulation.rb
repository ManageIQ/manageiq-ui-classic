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
          records = find_records_with_rbac(VmOrTemplate, checked_or_params)

          if records.empty?
            add_flash(_("At least 1 VM must be selected for Policy Simulation"), :error)
            @refresh_div = "flash_msg_div"
            @refresh_partial = "layouts/flash_msg"
          else
            session[:tag_items] = records   # Set the array of tag items
            session[:tag_db] = VmOrTemplate # Remember the DB
            if @explorer
              @edit ||= {}
              @edit[:explorer] = true       # Since no @edit, create @edit and save explorer to use while building url for vms in policy sim grid
              @edit[:pol_items] = records
              session[:edit] = @edit
              policy_sim(records)
              @refresh_partial = "layouts/policy_sim"
            else
              javascript_redirect(:controller => 'vm', :action => 'policy_sim') # redirect to build the policy simulation screen
            end
          end
        end
        alias image_policy_sim polsimvms
        alias instance_policy_sim polsimvms
        alias vm_policy_sim polsimvms
        alias miq_template_policy_sim polsimvms
      end
    end
  end
end
