module Mixins
  module Actions
    module VmActions
      module Retire
        # Retire 1 or more items (vms, stacks, services)
        def retirevms
          assert_privileges(params[:pressed])
          # check to see if coming from show_list or drilled into vms from another CI
          if request.parameters[:controller] == "vm" || %w[all_vms instances vms].include?(params[:display])
            rec_cls = "vm"
            bc_msg = _("Retire VM or Instance")
          elsif request.parameters[:controller] == "service"
            rec_cls =  "service"
            bc_msg = _("Retire Service")
          elsif request.parameters[:controller] == "orchestration_stack" || %w[orchestration_stacks].include?(params[:display])
            rec_cls = "orchestration_stack"
            bc_msg = _("Retire Orchestration Stack")
          end
          selected_items = checked_or_params
          @edit ||= {}
          @edit[:object_ids] = selected_items
          session[:edit] = @edit
          if !%w[orchestration_stack service].include?(request.parameters["controller"]) && !%w[orchestration_stacks].include?(params[:display]) &&
             VmOrTemplate.find(selected_items).any? { |vm| !vm.supports_retire? }
            add_flash(_("Set Retirement Date does not apply to selected VM Template"), :error)
            javascript_flash(:scroll_top => true)
            return
          end
          session[:retire_items] = selected_items # Set the array of retire items
          session[:assigned_filters] = assigned_filters
          if @explorer
            retire
          else
            drop_breadcrumb(:name => bc_msg,
                            :url  => "/#{session[:controller]}/retire")
            javascript_redirect(:controller => rec_cls, :action => 'retire') # redirect to build the retire screen
          end
        end

        alias instance_retire retirevms
        alias vm_retire retirevms
        alias orchestration_stack_retire retirevms

        # Build the retire VMs screen
        def retire
          @sb[:explorer] = true if @explorer
          kls = case request.parameters[:controller]
                when "orchestration_stack"
                  OrchestrationStack
                when "service"
                  Service
                when "vm_infra", "vm_cloud", "vm", "vm_or_template"
                  Vm
                end
          # Check RBAC for all items in session[:retire_items]
          @retireitems = find_records_with_rbac(kls.order(:name), session[:retire_items])

          @redirect_url = @sb[:explorer] ? 'explorer' : previous_breadcrumb_url

          drop_breadcrumb(:name => _("Retire %{name}") % {:name => ui_lookup(:models => kls.to_s)},
                          :url  => "/#{session[:controller]}/retire")
          session[:cat] = nil # Clear current category
          build_targets_hash(@retireitems)
          @view = get_db_view(kls) # Instantiate the MIQ Report view object
          @in_a_form = true
          @edit[:object_ids] = @retireitems
          @refresh_partial = "shared/views/retire" if @explorer || @layout == "orchestration_stack"
        end
      end
    end
  end
end
