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
          ownership_items = []
          # check to see if coming from show_list or drilled into vms from another CI
          controller = if request.parameters[:controller] == "vm" || ["all_vms", "vms", "instances", "images"].include?(params[:display])
                         "vm"
                       elsif ["miq_templates", "images"].include?(params[:display]) || params[:pressed].starts_with?("miq_template_")
                         "miq_template"
                       else
                         request.parameters[:controller]
                       end
          @edit ||= {}
          @edit[:controller] = controller
          recs = []
          if !session[:checked_items].nil? && @lastaction == "set_checked_items"
            recs = session[:checked_items]
          else
            recs = find_checked_ids_with_rbac(get_class_from_controller_param(controller))
          end
          if recs.blank?
            id = find_id_with_rbac(get_class_from_controller_param(params[:controller]), params[:id])
            recs = [id.to_i]
          end
          @edit[:object_ids] = recs
          if recs.length < 1
            add_flash(_("One or more %{model} must be selected to Set Ownership") % {
              :model => Dictionary.gettext(db.to_s, :type => :model, :notfound => :titleize, :plural => true)}, :error)
            @refresh_div = "flash_msg_div"
            @refresh_partial = "layouts/flash_msg"
            return
          else
            ownership_items = recs.collect(&:to_i)
          end

          if filter_ownership_items(get_class_from_controller_param(controller), ownership_items).empty?
            add_flash(_('None of the selected items allow ownership changes'), :error)
            @refresh_div = "flash_msg_div"
            @refresh_partial = "layouts/flash_msg"
            return
          end

          if @explorer
            @sb[:explorer] = true
            ownership(ownership_items)
          else
            if role_allows?(:feature => "vm_ownership")
              drop_breadcrumb(:name => _("Set Ownership"), :url => "/vm_common/ownership")
              javascript_redirect :controller => controller, :action => 'ownership', :rec_ids => ownership_items, :escape => false # redirect to build the ownership screen
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
          end
        end

        # Assign/unassign ownership to a set of objects
        def ownership(ownership_items = [])
          @sb[:explorer] = true if @explorer
          @in_a_form = @ownershipedit = true
          drop_breadcrumb(:name => _("Set Ownership"), :url => "/vm_common/ownership")
          ownership_items = params[:rec_ids] if params[:rec_ids]
          build_ownership_info(ownership_items)
          return if @ownershipitems.empty?
          build_targets_hash(@ownershipitems)
          if @sb[:explorer]
            @refresh_partial = "shared/views/ownership"
          else
            render :action => "show"
          end
        end

        def filter_ownership_items(klass, ownership_items)
          @origin_ownership_items = ownership_items
          @ownershipitems ||= begin
            ownership_scope = klass.where(:id => ownership_items)
            ownership_scope = ownership_scope.with_ownership if klass.respond_to?(:with_ownership)
            Rbac.filtered(ownership_scope.order(:name))
          end
        end

        def build_ownership_info(ownership_items)
          @edit ||= {}
          klass = get_class_from_controller_param(params[:controller])
          record = klass.find(ownership_items[0])
          user = record.evm_owner if ownership_items.length == 1
          @user = user ? user.id.to_s : nil

          @groups = {} # Create new entries hash (2nd pulldown)
          # need to do this only if 1 vm is selected and miq_group has been set for it
          group = record.miq_group if ownership_items.length == 1
          @group = group ? group.id.to_s : nil
          Rbac.filtered(MiqGroup.non_tenant_groups).each { |g| @groups[g.description] = g.id.to_s }

          @user = @group = 'dont-change' if ownership_items.length > 1
          @edit[:object_ids] = filter_ownership_items(klass, ownership_items)
          @view = get_db_view(klass == VmOrTemplate ? Vm : klass) # Instantiate the MIQ Report view object
          @view.table = MiqFilter.records2table(@ownershipitems, @view.cols + ['id'])
          session[:edit] = @edit
        end

        # Build the ownership assignment screen
        def build_ownership_hash(ownership_items)
          klass = get_class_from_controller_param(params[:controller])
          record = klass.find(ownership_items[0])
          user = record.evm_owner if ownership_items.length == 1
          @user = user ? user.id.to_s : ''
          @groups = {}
          group = record.miq_group if ownership_items.length == 1
          @group = group ? group.id.to_s : nil
          Rbac.filtered(MiqGroup).each { |g| @groups[g.description] = g.id.to_s }
          @user = @group = 'dont-change' if ownership_items.length > 1
          @ownershipitems = Rbac.filtered(klass.where(:id => ownership_items).order(:name), :class => klass)
          raise _('Invalid items passed') unless @ownershipitems.pluck(:id).to_set == ownership_items.map(&:to_i).to_set
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
          when "cancel"
            add_flash(_("Set Ownership was cancelled by the user"))
            if @sb[:explorer]
              @edit = @sb[:action] = nil
              replace_right_cell
            else
              session[:flash_msgs] = @flash_array
              javascript_redirect previous_breadcrumb_url
            end
          when "save"
            opts = {}
            unless params[:user] == 'dont-change'
              if params[:user].blank?     # to clear previously set user
                opts[:owner] = nil
              elsif params[:user] != @user
                opts[:owner] = User.find(params[:user])
              end
            end

            unless params[:group] == 'dont-change'
              if params[:group].blank?    # to clear previously set group
                opts[:group] = nil
              elsif params[:group] != @group
                opts[:group] = MiqGroup.find_by_id(params[:group])
              end
            end

            klass = get_class_from_controller_param(request.parameters[:controller])
            param_ids = params[:objectIds].map(&:to_i)
            raise _('Invalid items selected.') unless valid_items_for(klass, param_ids)

            result = klass.set_ownership(param_ids, opts)
            unless result == true
              result["missing_ids"].each { |msg| add_flash(msg, :error) } if result["missing_ids"]
              result["error_updating"].each { |msg| add_flash(msg, :error) } if result["error_updating"]
              javascript_flash
            else
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
            end
          when "reset"
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
        end
      end
    end
  end
end
