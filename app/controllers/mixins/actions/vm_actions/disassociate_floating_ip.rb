module Mixins
  module Actions
    module VmActions
      module DisassociateFloatingIp
        def disassociate_floating_ip_vms
          assert_privileges("instance_disassociate_floating_ip")
          recs = checked_or_params
          @record = find_record_with_rbac(VmCloud, recs.first)
          if @record.supports?(:disassociate_floating_ip) && @record.ext_management_system.present?
            if @explorer
              disassociate_floating_ip
              @refresh_partial = "vm_common/disassociate_floating_ip"
            else
              render :update do |page|
                page << javascript_prologue
                page.redirect_to(:controller => 'vm',
                                 :action     => 'disassociate_floating_ip',
                                 :rec_id     => @record.id,
                                 :escape     => false)
              end
            end
          else
            add_flash(_("Unable to disassociate Floating IP from Instance \"%{name}\": %{details}") % {
              :name    => @record.name,
              :details => @record.unsupported_reason(:disassociate_floating_ip)
            }, :error)
          end
        end

        alias instance_disassociate_floating_ip disassociate_floating_ip_vms

        def disassociate_floating_ip
          assert_privileges("instance_disassociate_floating_ip")
          @record ||= find_record_with_rbac(VmCloud, params[:rec_id])
          unless @explorer
            drop_breadcrumb(
              :name => _("Disssociate Floating IP from Instance '%{name}'") % {:name => @record.name},
              :url  => "/vm_cloud/disassociate_floating_ip"
            )
          end
          @sb[:explorer] = @explorer
          @in_a_form = true
          @live_migrate = true
          render :action => "show" unless @explorer
        end

        def disassociate_floating_ip_form_fields
          assert_privileges("instance_disassociate_floating_ip")
          @record = find_record_with_rbac(VmCloud, params[:id])
          floating_ips = []
          unless @record.ext_management_system.nil?
            @record.floating_ips.each do |floating_ip|
              floating_ips << floating_ip
            end
          end
          render :json => {
            :floating_ips => floating_ips
          }
        end

        def disassociate_floating_ip_vm
          assert_privileges("instance_disassociate_floating_ip")
          @record = find_record_with_rbac(VmCloud, params[:id])
        end
      end
    end
  end
end
