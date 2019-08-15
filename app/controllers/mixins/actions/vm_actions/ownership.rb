module Mixins
  module Actions
    module VmActions
      module Ownership
        # Assign/unassign ownership to a set of objects
        def ownership_form_fields
          render :json => build_ownership_hash(params[:object_ids])
        end

        # Set Ownership selected db records
        def set_ownership
          assert_privileges(params[:pressed])
          # check to see if coming from show_list or drilled into vms from another CI
          controller = if request.parameters[:controller] == "vm" || ["all_vms", "vms", "instances"].include?(params[:display])
                         "vm"
                       elsif ["miq_templates", "images"].include?(params[:display]) || params[:pressed].starts_with?("miq_template_")
                         "miq_template"
                       else
                         request.parameters[:controller]
                       end
          @edit ||= {}
          @edit[:controller] = controller

          recs = session[:checked_items] || checked_or_params

          @edit[:object_ids] = recs
          if recs.empty?
            add_flash(_("One or more %{model} must be selected to Set Ownership") % {
              :model => Dictionary.gettext(db.to_s, :type => :model, :notfound => :titleize, :plural => true)}, :error)
            @refresh_div = "flash_msg_div"
            @refresh_partial = "layouts/flash_msg"
            return
          end

          @origin_ownership_items = recs.collect(&:to_i)
          @ownershipitems = filter_ownership_items(get_class_from_controller_param(controller), recs)

          if @ownershipitems.nil? || @ownershipitems.empty?
            add_flash(_('None of the selected items allow ownership changes'), :error)
            @refresh_div = "flash_msg_div"
            @refresh_partial = "layouts/flash_msg"
            return
          end

          if @explorer
            @sb[:explorer] = true
            ownership(@origin_ownership_items)
          else
            if role_allows?(:feature => "vm_ownership")
              drop_breadcrumb(:name => _("Set Ownership"), :url => "/vm_common/ownership")
              javascript_redirect :controller => controller, :action => 'ownership', :rec_ids => @origin_ownership_items, :escape => false # redirect to build the ownership screen
            else
              head :ok
            end
          end
        end

        alias_method :image_ownership, :set_ownership
        alias_method :instance_ownership, :set_ownership
        alias_method :vm_ownership, :set_ownership
        alias_method :miq_template_ownership, :set_ownership

        def get_class_from_controller_param(controller)
          case controller
          when "orchestration_stack"
            OrchestrationStack
          when "service"
            Service
          when "vm_or_template", "vm_infra", "vm_cloud", "vm"
            VmOrTemplate
          when "miq_template"
            MiqTemplate
          when "auth_key_pair_cloud"
            ManageIQ::Providers::CloudManager::AuthKeyPair
          end
        end

        # Assign/unassign ownership to a set of objects
        def ownership(ownership_ids = [])
          @sb[:explorer] = true if @explorer
          @in_a_form = @ownershipedit = true
          drop_breadcrumb(:name => _("Set Ownership"), :url => "/vm_common/ownership")
          ownership_ids = params[:rec_ids] if params[:rec_ids]
          @origin_ownership_items = ownership_ids
          build_ownership_info(ownership_ids)
          return if @ownershipitems.empty?
          build_targets_hash(@ownershipitems)
          if @sb[:explorer]
            @refresh_partial = "shared/views/ownership"
          else
            render :action => "show"
          end
        end

        def build_ownership_info(ownership_ids)
          @edit ||= {}
          klass = get_class_from_controller_param(params[:controller])
          load_user_group_items(ownership_ids, klass)

          @groups = {} # Create new entries hash (2nd pulldown)
          Rbac.filtered(MiqGroup.non_tenant_groups).each { |g| @groups[g.description] = g.id.to_s }
          @edit[:object_ids] = @ownershipitems
          @view = get_db_view(klass == VmOrTemplate ? Vm : klass) # Instantiate the MIQ Report view object
          @view.table = ReportFormatter::Converter.records2table(@ownershipitems, @view.cols + ['id'])
          session[:edit] = @edit
        end

        # Build the ownership assignment screen
        def build_ownership_hash(ownership_ids)
          klass = get_class_from_controller_param(params[:controller])
          @ownershipitems ||= filter_ownership_items(klass, ownership_ids)
          load_user_group_items(ownership_ids, klass)

          @groups = {}
          Rbac.filtered(MiqGroup).each { |g| @groups[g.description] = g.id.to_s }
          raise _('Invalid items passed') unless @ownershipitems.pluck(:id).to_set == ownership_ids.map(&:to_i).to_set
          {:user  => @user,
           :group => @group}
        end

        def valid_items_for(klass, param_ids)
          scope = klass.respond_to?(:with_ownership) ? klass.with_ownership : klass
          checked_ids = Rbac.filtered(scope.where(:id => param_ids)).pluck(:id)
          checked_ids.to_set == param_ids.to_set
        end

        def ownership_update
          case params[:button]
          when "cancel" then ownership_handle_cancel_button
          when "save" then ownership_handle_save_button
          when "reset" then ownership_handle_reset_button
          end
        end

        private

        def load_user_group_items(ownership_ids, klass)
          @ownershipitems ||= filter_ownership_items(klass, ownership_ids)
          if @ownershipitems.length > 1
            @user = @group = 'dont-change'
          else
            record = @ownershipitems.first
            @user = record.evm_owner.id.to_s if record.evm_owner
            @group = record.miq_group.id.to_s if record.miq_group
          end
        end

        def ownership_handle_cancel_button
          add_flash(_("Set Ownership was cancelled by the user"))
          if @sb[:explorer]
            @edit = @sb[:action] = nil
            replace_right_cell
          else
            session[:flash_msgs] = @flash_array
            javascript_redirect previous_breadcrumb_url
          end
        end

        def ownership_handle_save_button
          opts = {}

          unless params[:user] == 'dont-change'
            opts[:owner] = if params[:user].blank? # to clear previously set user
                             nil
                           elsif params[:user] != @user
                            User.find(params[:user])
                           end
          end

          unless params[:group] == 'dont-change'
            opts[:group] = if params[:group].blank? # to clear previously set group
                             nil
                           elsif params[:group] != @group
                             MiqGroup.find(params[:group])
                           end
          end


          klass = get_class_from_controller_param(request.parameters[:controller])
          param_ids = params[:objectIds].map(&:to_i)
          raise _('Invalid items selected.') unless valid_items_for(klass, param_ids)

          result = klass.set_ownership(param_ids, opts)
          if result
            object_types = object_types_for_flash_message(klass, params[:objectIds])

            flash = _("Ownership saved for selected %{object_types}") % {:object_types => object_types}
            add_flash(flash)
            if @sb[:explorer]
              @sb[:action] = nil
              replace_right_cell
            else
              session[:flash_msgs] = @flash_array
              javascript_redirect previous_breadcrumb_url
            end
          else
            result["missing_ids"].each { |msg| add_flash(msg, :error) } if result["missing_ids"]
            result["error_updating"].each { |msg| add_flash(msg, :error) } if result["error_updating"]
            javascript_flash
          end
        end

        def ownership_handle_reset_button
          @in_a_form = true
          if @edit[:explorer]
            ownership
            add_flash(_("All changes have been reset"), :warning)
            request.parameters[:controller] == "service" ? replace_right_cell(:nodetype => "ownership") : replace_right_cell
          else
            javascript_redirect :action        => 'ownership',
                                :flash_msg     => _("All changes have been reset"),
                                :flash_warning => true,
                                :escape        => true
          end
        end

        def filter_ownership_items(klass, ownership_ids)
          records = find_records_with_rbac(klass.order(:name), ownership_ids)
          records.try(:with_ownership) || records
        end
      end
    end
  end
end
