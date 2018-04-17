module Mixins
  module Actions
    module VmActions
      module Resize
        def resizevms
          assert_privileges("instance_resize")
          recs = find_checked_items
          recs = [params[:id].to_i] if recs.blank?
          @record = find_record_with_rbac(VmOrTemplate, recs.first) # Set the VM object
          if @record.supports_resize?
            if @explorer
              resize
              @refresh_partial = "vm_common/resize"
            else
              javascript_redirect :controller => 'vm', :action => 'resize', :rec_id => @record.id, :escape => false # redirect to build the retire screen
            end
          else
            add_flash(_("Unable to reconfigure Instance \"%{name}\": %{details}") % {
              :name    => @record.name,
              :details => @record.unsupported_reason(:resize)}, :error)
          end
        end

        alias instance_resize resizevms

        def resize
          assert_privileges("instance_resize")
          @record ||= find_record_with_rbac(VmOrTemplate, params[:rec_id])
          unless @explorer
            drop_breadcrumb(
              :name => _("Reconfigure Instance '%{name}'") % {:name => @record.name},
              :url  => "/vm/resize"
            )
          end
          @sb[:explorer] = @explorer
          @in_a_form = true
          @resize = true
          render :action => "show" unless @explorer
        end

        def resize_vm
          assert_privileges("instance_resize")
          @record = find_record_with_rbac(VmOrTemplate, params[:id])

          case params[:button]
          when "cancel"
            add_flash(_("Reconfigure of Instance \"%{name}\" was cancelled by the user") % {:name => @record.name})
            @record = @sb[:action] = nil
          when "submit"
            if @record.supports_resize?
              begin
                flavor_id = params['flavor_id']
                flavor = find_record_with_rbac(Flavor, flavor_id)
                old_flavor_name = @record.flavor.try(:name) || _("unknown")
                # TODO: still need to determine whether the next line should be deleted or replaced
                @request_id = nil
                options = {:src_ids       => [@record.id],
                           :instance_type => flavor_id}
                VmCloudReconfigureRequest.make_request(@request_id, options, current_user)
                add_flash(_("Reconfiguring Instance \"%{name}\" from %{old_flavor} to %{new_flavor}") % {
                  :name       => @record.name,
                  :old_flavor => old_flavor_name,
                  :new_flavor => flavor.name})
              rescue => ex
                add_flash(_("Unable to reconfigure Instance \"%{name}\": %{details}") % {
                  :name    => @record.name,
                  :details => get_error_message_from_fog(ex.to_s)}, :error)
              end
            else
              add_flash(_("Unable to reconfigure Instance \"%{name}\": %{details}") % {
                :name    => @record.name,
                :details => @record.unsupported_reason(:resize)}, :error)
            end
            params[:id] = @record.id.to_s # reset id in params for show
            @record = nil
            @sb[:action] = nil
          end
          if @sb[:explorer]
            replace_right_cell
          else
            flash_to_session
            javascript_redirect previous_breadcrumb_url
          end
          return
        end

        def resize_form_fields
          assert_privileges("instance_resize")
          @record = find_record_with_rbac(VmOrTemplate, params[:id])
          flavors = []
          unless @record.ext_management_system.nil?
            @record.ext_management_system.flavors.each do |ems_flavor|
              # include only flavors with root disks at least as big as the instance's current root disk.
              if @record.flavor.nil? || ((ems_flavor != @record.flavor) && (ems_flavor.root_disk_size >= @record.flavor.root_disk_size))
                flavors << {:name => ems_flavor.name_with_details, :id => ems_flavor.id}
              end
            end
          end
          render :json => {
            :flavors => flavors
          }
        end
      end
    end
  end
end
