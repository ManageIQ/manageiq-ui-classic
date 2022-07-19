module Mixins
  module Actions
    module VmActions
      module RemoveSecurityGroup
        def remove_security_group_vms
          assert_privileges("instance_remove_security_group")
          recs = checked_or_params
          @record = find_record_with_rbac(VmCloud, recs.first)
          if @record.supports?(:remove_security_group) && @record.ext_management_system.present?
            if @explorer
              remove_security_group
              @refresh_partial = "vm_common/remove_security_group"
            else
              javascript_redirect(:controller => 'vm', :action => 'remove_security_group', :rec_id => @record.id, :escape => false)
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
      end
    end
  end
end
