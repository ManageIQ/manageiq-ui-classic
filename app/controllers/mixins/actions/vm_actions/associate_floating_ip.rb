module Mixins
  module Actions
    module VmActions
      module AssociateFloatingIp
        def associate_floating_ip_vms
          assert_privileges("instance_associate_floating_ip")
          recs = checked_or_params
          @record = find_record_with_rbac(VmCloud, recs.first)
          if @record.supports?(:associate_floating_ip) && @record.ext_management_system.present?
            if @explorer
              associate_floating_ip
              @refresh_partial = "vm_common/associate_floating_ip"
            else
              render :update do |page|
                page << javascript_prologue
                page.redirect_to(:controller => 'vm',
                                 :action     => 'associate_floating_ip',
                                 :rec_id     => @record.id,
                                 :escape     => false)
              end
            end
          else
            add_flash(_("Unable to associate Floating IP with Instance \"%{name}\": %{details}") % {
              :name    => @record.name,
              :details => @record.unsupported_reason(:associate_floating_ip)
            }, :error)
          end
        end

        alias instance_associate_floating_ip associate_floating_ip_vms

        def associate_floating_ip
          assert_privileges("instance_associate_floating_ip")
          @record ||= find_record_with_rbac(VmCloud, params[:rec_id])
          unless @explorer
            drop_breadcrumb(
              :name => _("Associate Floating IP with Instance '%{name}'") % {:name => @record.name},
              :url  => "/vm_cloud/associate_floating_ip"
            )
          end
          @sb[:explorer] = @explorer
          @in_a_form = true
          @associate_floating_ip = true
          render :action => "show" unless @explorer
        end

        def associate_floating_ip_form_fields
          assert_privileges("instance_associate_floating_ip")
          @record = find_record_with_rbac(VmCloud, params[:id])
          floating_ips = @record.cloud_tenant.nil? ? [] : @record.cloud_tenant.floating_ips.where(:vm_id => nil)

          render :json => {
            :floating_ips => floating_ips
          }
        end

        def associate_floating_ip_vm
          assert_privileges("instance_associate_floating_ip")
          @record = find_record_with_rbac(VmCloud, params[:id])

          if @sb[:explorer]
            replace_right_cell
          else
            flash_to_session
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
