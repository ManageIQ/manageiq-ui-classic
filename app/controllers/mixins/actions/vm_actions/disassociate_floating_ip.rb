module Mixins
  module Actions
    module VmActions
      module DisassociateFloatingIp
        def disassociate_floating_ip_vms
          assert_privileges("instance_disassociate_floating_ip")
          recs = checked_or_params
          @record = find_record_with_rbac(VmCloud, recs.first)
          if @record.supports_disassociate_floating_ip? && @record.ext_management_system.present?
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

          case params[:button]
          when "cancel" then disassociate_handle_cancel_button
          when "submit" then disassociate_handle_submit_button
          end
        end

        private

        def disassociate_handle_cancel_button
          add_flash(_("Disassociation of Floating IP from Instance \"%{name}\" was cancelled by the user") % {:name => @record.name})
          @record = @sb[:action] = nil
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

        def disassociate_handle_submit_button
          if @record.supports_disassociate_floating_ip?
            floating_ip = params[:floating_ip][:address]
            begin
              @record.disassociate_floating_ip_queue(session[:userid], floating_ip)
              add_flash(_("Disassociating Floating IP %{address} from Instance \"%{name}\"") % {
                :address => floating_ip,
                :name    => @record.name
              })
            rescue StandardError => ex
              add_flash(_("Unable to disassociate Floating IP %{address} from Instance \"%{name}\": %{details}") % {
                :address => floating_ip,
                :name    => @record.name,
                :details => get_error_message_from_fog(ex.to_s)
              }, :error)
            end
          else
            add_flash(_("Unable to disassociate Floating IP from Instance \"%{name}\": %{details}") % {
              :name    => @record.name,
              :details => @record.unsupported_reason(:disassociate_floating_ip)
            }, :error)
          end
          params[:id] = @record.id.to_s # reset id in params for show
          @record = nil
          @sb[:action] = nil
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
