module Mixins
  module Actions
    module VmActions
      module Resize
        def resizevms
          case params[:pressed]
          when "instance_resize"
            assert_privileges("instance_resize")
          when "miq_request_edit"
            assert_privileges("miq_request_edit")
          else
            raise MiqException::RbacPrivilegeException, _("The user is not authorized for this task or item.")
          end
          # if coming in to edit from miq_request list view
          recs = checked_or_params
          @record = nil
          if !session[:checked_items].nil? && (@lastaction == "set_checked_items" || params[:pressed] == "miq_request_edit")
            request_id = params[:id]
            @record = VmCloudReconfigureRequest.find(request_id).vms.first
          end

          @record ||= find_record_with_rbac(VmOrTemplate, recs.first) # Set the VM object
          if @record.supports?(:resize)
            if @explorer
              resize
              @refresh_partial = "vm_common/resize"
            else
              javascript_redirect(:controller => 'vm',
                                  :action     => 'resize',
                                  :req_id     => request_id,
                                  :rec_id     => @record.id,
                                  :escape     => false) # redirect to build the retire screen
            end
          else
            add_flash(_("Unable to reconfigure Instance \"%{name}\": %{details}") % {
              :name    => @record.name,
              :details => @record.unsupported_reason(:resize)
            }, :error)
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
          @request_id = params[:req_id]
          @in_a_form = true
          @resize = true
          render :action => "show" unless @explorer
        end
      end
    end
  end
end
