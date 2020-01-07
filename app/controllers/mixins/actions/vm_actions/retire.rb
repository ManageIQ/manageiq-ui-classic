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

        alias_method :instance_retire, :retirevms
        alias_method :vm_retire, :retirevms
        alias_method :orchestration_stack_retire, :retirevms

        def retirement_info
          obj = case request.parameters[:controller]
                when 'orchestration_stack'
                  assert_privileges('orchestration_stack_retire')
                  OrchestrationStack.find_by(:id => params[:id])
                when 'service'
                  assert_privileges('service_retire')
                  Service.find_by(:id => params[:id])
                when 'vm', 'vm_cloud', 'vm_infra', 'vm_or_template'
                  obj = Vm.find_by(:id => params[:id])
                  obj.cloud ? assert_privileges('instance_retire') : assert_privileges('vm_retire')
                  obj
                end
          render :json => {
            :retirement_date    => obj.retires_on,
            :retirement_warning => obj.retirement_warn
          }
        end

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
          if params[:button]
            begin
              add_flash(retire_handle_form_buttons(kls))
            rescue RuntimeError => e
              add_flash(e.message, :error)
            end
            if @sb[:explorer]
              replace_right_cell
            else
              flash_to_session
              javascript_redirect(previous_breadcrumb_url)
            end
            return
          end
          session[:changed] = @changed = false
          drop_breadcrumb(:name => _("Retire %{name}") % {:name => ui_lookup(:models => kls.to_s)},
                          :url  => "/#{session[:controller]}/retire")
          session[:cat] = nil # Clear current category
          build_targets_hash(@retireitems)
          @view = get_db_view(kls) # Instantiate the MIQ Report view object
          @gtl_type = "grid"
          if @retireitems.length == 1 && !@retireitems[0].retires_on.nil?
            t = @retireitems[0].retires_on                                         # Single VM, set to current time
            w = @retireitems[0].retirement_warn if @retireitems[0].retirement_warn # Single VM, get retirement warn
          end
          session[:retire_date] = "#{t.month}/#{t.day}/#{t.year}" unless t.nil?
          session[:retire_warn] = w
          @in_a_form = true
          @edit ||= {}
          @edit[:object_ids] = @retireitems
          session[:edit] = @edit
          @refresh_partial = "shared/views/retire" if @explorer || @layout == "orchestration_stack"
        end

        private

        def retire_handle_form_buttons(kls)
          case params[:button]
          when "cancel" then retire_handle_cancel_button
          when "save"   then handle_save_button(kls)
          end
        end

        def retire_handle_cancel_button
          @sb[:action] = nil
          _("Set/remove retirement date was cancelled by the user")
        end

        def handle_save_button(kls)
          if params[:retire_date].blank?
            flash = n_("Retirement date removed", "Retirement dates removed", session[:retire_items].length)
          else
            t = params[:retire_date].in_time_zone
            w = params[:retire_warn].to_i

            ts = t.strftime("%x %R %Z")
            flash = n_("Retirement date set to %{time}", "Retirement dates set to %{time}", session[:retire_items].length) % {:time => ts}
          end
          kls.retire(session[:retire_items], :date => t, :warn => w) # Call the model to retire the VM(s)
          @sb[:action] = nil
          flash
        end
      end
    end
  end
end
