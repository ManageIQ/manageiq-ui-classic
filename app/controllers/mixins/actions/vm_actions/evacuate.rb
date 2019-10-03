module Mixins
  module Actions
    module VmActions
      module Evacuate
        def evacuate
          assert_privileges("instance_evacuate")
          drop_breadcrumb(:name => _("Evacuate Instances"), :url => "/vm_cloud/evacuate") unless @explorer
          @sb[:explorer] = @explorer
          @in_a_form = true
          @evacuate = true

          @evacuate_items = find_records_with_rbac(VmOrTemplate, session[:evacuate_items]).sort_by(&:name)
          build_targets_hash(@evacuate_items)
          @view = get_db_view(VmOrTemplate)
          @gtl_type = "grid"

          render :action => "show" unless @explorer
        end

        def evacuatevms
          assert_privileges("instance_evacuate")
          session[:evacuate_items] = checked_or_params
          if @explorer
            evacuate
            @refresh_partial = "vm_common/evacuate"
          else
            javascript_redirect(:controller => 'vm', :action => 'evacuate', :escape => false)
          end
        end

        alias instance_evacuate evacuatevms

        def evacuate_vm
          assert_privileges("instance_evacuate")

          case params[:button]
          when "cancel" then add_flash(_("Evacuation of Instances was cancelled by the user"))
          when "submit" then evacuate_handle_submit_button
          end

          @sb[:action] = nil
          if @sb[:explorer]
            replace_right_cell
          else
            flash_to_session
            javascript_redirect(previous_breadcrumb_url)
          end
        end

        def evacuate_form_fields
          assert_privileges("instance_evacuate")
          @record = find_record_with_rbac(VmOrTemplate, params[:id])
          hosts = []
          unless @record.ext_management_system.nil?
            begin
              connection = @record.ext_management_system.connect
              current_hostname = connection.handled_list(:servers).find do |s|
                s.name == @record.name
              end.os_ext_srv_attr_hypervisor_hostname
              hosts = connection.hosts.select { |h| h.service_name == "compute" && h.host_name != current_hostname }.map do |h|
                {:name => h.host_name, :id => h.host_name}
              end
            rescue
              hosts = []
            end
          end
          render :json => {
            :hosts => hosts
          }
        end

        private

        def evacuate_handle_submit_button
          @evacuate_items = find_records_with_rbac(VmOrTemplate, session[:evacuate_items]).sort_by(&:name)
          @evacuate_items.each do |vm|
            if vm.supports_evacuate?
              options = {
                :hostname          => params['auto_select_host']  == 'true' ? nil : params['destination_host'],
                :on_shared_storage => params['on_shared_storage'] == 'true',
                :admin_password    => params['on_shared_storage'] == 'true' ? nil : params['admin_password']
              }
              task_id = vm.class.evacuate_queue(session[:userid], vm, options)
              add_flash(_("Instance evacuation task failed."), :error) unless task_id.kind_of?(Integer)
              add_flash(_("Queued evacuation of Instance \"%{name}\"") % {:name => vm.name})
            else
              add_flash(_("Unable to evacuate Instance \"%{name}\": %{details}") % {
                :name    => vm.name,
                :details => vm.unsupported_reason(:evacuate)
              }, :error)
            end
          end
        end
      end
    end
  end
end
