module Mixins
  module Actions
    module VmActions
      module AddSecurityGroup
        def add_security_group_vms
          assert_privileges("instance_add_security_group")
          recs = checked_or_params
          @record = find_record_with_rbac(VmCloud, recs.first)
          if @record.supports_add_security_group? && @record.ext_management_system.present?
            if @explorer
              add_security_group
              @refresh_partial = "vm_common/add_security_group"
            else
              javascript_redirect :controller => 'vm', :action => 'add_security_group', :rec_id => @record.id, :escape => false
            end
          else
            add_flash(_("Unable to add Security Group to Instance \"%{name}\": %{details}") % {
              :name    => @record.name,
              :details => @record.unsupported_reason(:add_security_group)
            }, :error)
          end
        end

        alias instance_add_security_group add_security_group_vms

        def add_security_group
          assert_privileges("instance_add_security_group")
          @record ||= find_record_with_rbac(VmCloud, params[:rec_id])
          unless @explorer
            drop_breadcrumb(
              :name => _("Add Security Group to '%{name}'") % {:name => @record.name},
              :url  => "/vm_cloud/add_security_group"
            )
          end
          @sb[:explorer] = @explorer
          @in_a_form = true
          @add_security_group = true
          render :action => "show" unless @explorer
        end

        def add_security_group_vm
          assert_privileges("instance_add_security_group")
          @record = find_record_with_rbac(VmCloud, params[:id])
          case params[:button]
          when "cancel" then add_handle_cancel_button
          when "submit" then add_handle_submit_button
          end

          if @sb[:explorer]
            replace_right_cell
          else
            session[:flash_msgs] = @flash_array.dup
            javascript_redirect previous_breadcrumb_url
          end
        end

        def add_handle_cancel_button
          add_flash(_("Addition of Security Group to Instance \"%{name}\" was cancelled by the user") % {:name => @record.name})
          @record = @sb[:action] = nil
        end

        def add_handle_submit_button
          if @record.supports_add_security_group?
            security_group = params[:security_group]["name"]
            begin
              @record.add_security_group_queue(session[:userid], security_group)
              add_flash(_("Adding Security Group %{security_group} to Instance \"%{name}\"") % {
                :security_group => security_group,
                :name           => @record.name
              })
            rescue => ex
              add_flash(_("Unable to add Security Group %{security_group} to Instance \"%{name}\": %{details}") % {
                :security_group => security_group,
                :name           => @record.name,
                :details        => get_error_message_from_fog(ex.to_s)
              }, :error)
            end
          else
            add_flash(_("Unable to add Security Group to Instance \"%{name}\": %{details}") % {
              :name    => @record.name,
              :details => @record.unsupported_reason(:add_security_group)
            }, :error)
          end
          params[:id] = @record.id.to_s # reset id in params for show
          @record = nil
          @sb[:action] = nil
        end
      end
    end
  end
end
