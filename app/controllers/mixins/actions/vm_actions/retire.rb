module Mixins
  module Actions
    module VmActions
      module Retire
        # Retire 1 or more items (vms, stacks, services)
        def retirevms
          assert_privileges(params[:pressed])
          # check to see if coming from show_list or drilled into vms from another CI
          if request.parameters[:controller] == "vm" || %w(all_vms instances vms).include?(params[:display])
            rec_cls = "vm"
            bc_msg = _("Retire VM or Instance")
          elsif request.parameters[:controller] == "service"
            rec_cls =  "service"
            bc_msg = _("Retire Service")
          elsif request.parameters[:controller] == "orchestration_stack" || %w(orchestration_stacks).include?(params[:display])
            rec_cls = "orchestration_stack"
            bc_msg = _("Retire Orchestration Stack")
          end
          klass = rec_cls ? rec_cls.camelize.constantize : get_class_from_controller_param(params[:controller])
          selected_items = find_checked_ids_with_rbac(klass)
          @edit ||= {}
          @edit[:object_ids] = selected_items
          session[:edit] = @edit
          if !%w(orchestration_stack service).include?(request.parameters["controller"]) && !%w(orchestration_stacks).include?(params[:display]) &&
             VmOrTemplate.find(selected_items).any? { |vm| !vm.supports_retire? }
            add_flash(_("Set Retirement Date does not apply to selected %{model}") %
              {:model => ui_lookup(:table => "miq_template")}, :error)
            javascript_flash(:scroll_top => true)
            return
          end
          if selected_items.blank?
            session[:retire_items] = [params[:id]]
          elsif selected_items.empty?
              add_flash(_("At least one %{model} must be selected for tagging") %
                {:model => ui_lookup(:model => "Vm")}, :error)
              @refresh_div = "flash_msg_div"
              @refresh_partial = "layouts/flash_msg"
              return
          else
            session[:retire_items] = selected_items # Set the array of retire items
          end
          session[:assigned_filters] = assigned_filters
          if @explorer
            retire
          else
            drop_breadcrumb(:name => bc_msg,
                            :url  => "/#{session[:controller]}/retire")
            javascript_redirect :controller => rec_cls, :action => 'retire' # redirect to build the retire screen
          end
        end

        alias_method :instance_retire, :retirevms
        alias_method :vm_retire, :retirevms
        alias_method :orchestration_stack_retire, :retirevms

        def retirement_info
          case request.parameters[:controller]
          when "orchestration_stack"
            assert_privileges("orchestration_stack_retire")
            kls = OrchestrationStack
          when "service"
            assert_privileges("service_retire")
            kls = Service
          when "vm_cloud", "vm"
            assert_privileges("instance_retire")
            kls = Vm
          when "vm_infra"
            assert_privileges("vm_retire")
            kls = Vm
          end
          obj = kls.find_by_id(params[:id])
          render :json => {
            :retirement_date    => obj.retires_on.try(:strftime, '%m/%d/%Y'),
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
          if params[:button]
            if params[:button] == "cancel"
              flash = _("Set/remove retirement date was cancelled by the user")
              @sb[:action] = nil
            elsif params[:button] == "save"
              if params[:retire_date].blank?
                t = nil
                w = nil

                if session[:retire_items].length == 1
                  flash = _("Retirement date removed")
                else
                  flash = _("Retirement dates removed")
                end
              else
                t = params[:retire_date].in_time_zone
                w = params[:retire_warn].to_i

                ts = t.strftime("%x %R %Z")
                if session[:retire_items].length == 1
                  flash = _("Retirement date set to %{date}") % {:date => ts}
                else
                  flash = _("Retirement dates set to %{date}") % {:date => ts}
                end
              end
              kls.retire(session[:retire_items], :date => t, :warn => w) # Call the model to retire the VM(s)
              @sb[:action] = nil
            end
            add_flash(flash)
            if @sb[:explorer]
              replace_right_cell
            else
              session[:flash_msgs] = @flash_array.dup
              javascript_redirect previous_breadcrumb_url
            end
            return
          end
          session[:changed] = @changed = false
          drop_breadcrumb(:name => _("Retire %{name}") % {:name => ui_lookup(:models => kls.to_s)},
                          :url  => "/#{session[:controller]}/retire")
          session[:cat] = nil                 # Clear current category
          @retireitems = kls.find(session[:retire_items]).sort_by(&:name) # Get the db records
          build_targets_hash(@retireitems)
          @view = get_db_view(kls)              # Instantiate the MIQ Report view object
          @view.table = MiqFilter.records2table(@retireitems, @view.cols + ['id'])
          if @retireitems.length == 1 && !@retireitems[0].retires_on.nil?
            t = @retireitems[0].retires_on                                         # Single VM, set to current time
            w = @retireitems[0].retirement_warn if @retireitems[0].retirement_warn # Single VM, get retirement warn
          else
            t = nil
          end
          session[:retire_date] = t.nil? ? nil : "#{t.month}/#{t.day}/#{t.year}"
          session[:retire_warn] = w
          @in_a_form = true
          @edit ||= {}
          @edit[:object_ids] = @retireitems
          session[:edit] = @edit
          @refresh_partial = "shared/views/retire" if @explorer || @layout == "orchestration_stack"
        end
      end
    end
  end
end

