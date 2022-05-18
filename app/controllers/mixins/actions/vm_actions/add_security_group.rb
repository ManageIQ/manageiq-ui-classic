module Mixins
  module Actions
    module VmActions
      module AddSecurityGroup
        def add_security_group_vms
          assert_privileges("instance_add_security_group")
          recs = checked_or_params
          @record = find_record_with_rbac(VmCloud, recs.first)
          if @record.supports?(:add_security_group) && @record.ext_management_system.present?
            if @explorer
              add_security_group
              @refresh_partial = "vm_common/add_security_group"
            else
              javascript_redirect(:controller => 'vm', :action => 'add_security_group', :rec_id => @record.id, :escape => false)
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
      end
    end
  end
end
