module Mixins
  module Actions
    module VmActions
      module RemoveSecurityGroup
        def remove_security_group_vms
          assert_privileges("instance_remove_security_group")
          recs = checked_or_params
          @record = find_record_with_rbac(VmCloud, recs.first)
          if @record.supports_remove_security_group? && @record.ext_management_system.present?
            if @explorer
              remove_security_group
              @refresh_partial = "vm_common/remove_security_group"
            else
              render :update do |page|
                page << javascript_prologue
                page.redirect_to(:controller => 'vm',
                                 :action     => 'remove_security_group',
                                 :rec_id     => @record.id,
                                 :escape     => false)
              end
            end
          else
            add_flash(_("Unable to remove Security Group from Instance \"%{name}\": %{details}") % {
              :name    => @record.name,
              :details => @record.unsupported_reason(:remove_security_group)
            }, :error)
          end
        end

        alias instance_remove_security_group remove_security_group_vms

        def remove_security_group
          assert_privileges("instance_remove_security_group")
          @record ||= find_record_with_rbac(VmCloud, params[:rec_id])
          unless @explorer
            drop_breadcrumb(
              :name => _("Remove Security Group to '%{name}'") % {:name => @record.name},
              :url  => "/vm_cloud/remove_security_group"
            )
          end
          @sb[:explorer] = @explorer
          @in_a_form = true
          @remove_security_group = true
          render :action => "show" unless @explorer
        end

        def remove_security_group_vm
          assert_privileges("instance_remove_security_group")
          @record = find_record_with_rbac(VmCloud, params[:id])
          case params[:button]
          when "cancel" then remove_handle_cancel_button
          when "submit" then remove_handle_submit_button
          end
        end

        private

        def remove_handle_cancel_button
          add_flash(_("Removal of Security Group from Instance \"%{name}\" was cancelled by the user") % {:name => @record.name})
          @record = @sb[:action] = nil
        end

        def remove_handle_submit_button
          if @record.supports_remove_security_group?
            security_group = params[:security_group]["name"]
            begin
              @record.remove_security_group_queue(session[:userid], security_group)
              add_flash(_("Removing Security Group %{security_group} from Instance \"%{name}\"") % {
                :security_group => security_group,
                :name           => @record.name
              })
            rescue => ex
              add_flash(_("Unable to remove Security Group %{security_group} from Instance \"%{name}\": %{details}") % {
                :security_group => security_group,
                :name           => @record.name,
                :details        => get_error_message_from_fog(ex.to_s)
              }, :error)
            end
          else
            add_flash(_("Unable to remove Security Group from Instance \"%{name}\": %{details}") % {
              :name    => @record.name,
              :details => @record.unsupported_reason(:remove_security_group)
            }, :error)
          end
          params[:id] = @record.id.to_s # reset id in params for show
          @record = nil
          @sb[:action] = nil
          if @sb[:explorer]
            replace_right_cell
          else
            session[:flash_msgs] = @flash_array.dup
            render :update do |page|
              page << javascript_prologue
              page.redirect_to(previous_breadcrumb_url)
            end
          end
        end
      end
    end
  end
end
