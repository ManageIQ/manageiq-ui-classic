module Mixins
  module Actions
    module VmActions
      module LiveMigrate
        def livemigratevms
          assert_privileges("instance_live_migrate")
          session[:live_migrate_items] = checked_or_params
          if @explorer
            live_migrate
            @refresh_partial = "vm_common/live_migrate"
          else
            javascript_redirect(:controller => 'vm', :action => 'live_migrate', :escape => false)
          end
        end

        alias instance_live_migrate livemigratevms

        def live_migrate
          assert_privileges("instance_live_migrate")
          drop_breadcrumb(:name => _("Live Migrate Instances"), :url => "/vm_cloud/live_migrate") unless @explorer
          @sb[:explorer] = @explorer
          @in_a_form = true
          @live_migrate = true

          @live_migrate_items = find_records_with_rbac(VmOrTemplate.order(:name), session[:live_migrate_items])
          build_targets_hash(@live_migrate_items)
          @view = get_db_view(VmOrTemplate)

          render :action => "show" unless @explorer
        end

        def live_migrate_form_fields
          assert_privileges("instance_live_migrate")
          @record = find_record_with_rbac(VmOrTemplate, params[:id])
          hosts = []
          unless @record.ext_management_system.nil?
            # wrap in a rescue block in the event the connection to the provider fails
            begin
              connection = @record.ext_management_system.connect
              current_hostname = connection.handled_list(:servers).find do |s|
                s.name == @record.name
              end.os_ext_srv_attr_hypervisor_hostname
              # OS requires its own name for the host be used in the migrate API, so get the
              # provider hostname from fog.
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

        def live_migrate_vm
          assert_privileges("instance_live_migrate")
          case params[:button]
          when "cancel"
            add_flash(_("Live migration of Instances was cancelled by the user"))
          when "submit"
            @live_migrate_items = find_records_with_rbac(VmOrTemplate.order(:name), session[:live_migrate_items])
            @live_migrate_items.each do |vm|
              if vm.supports_live_migrate?
                options = {
                  :hostname         => params['auto_select_host'] == 'on' ? nil : params['destination_host'],
                  :block_migration  => params['block_migration']   == 'on',
                  :disk_over_commit => params['disk_over_commit']  == 'on'
                }
                task_id = vm.class.live_migrate_queue(session[:userid], vm, options)
                unless task_id.kind_of?(Integer)
                  add_flash(_("Instance live migration task failed."), :error)
                end
                add_flash(_("Queued live migration of Instance \"%{name}\"") % {:name => vm.name})
              else
                add_flash(_("Unable to live migrate Instance \"%{name}\": %{details}") % {
                  :name    => vm.name,
                  :details => vm.unsupported_reason(:live_migrate)
                }, :error)
              end
            end
          end
          @sb[:action] = nil
          if @sb[:explorer]
            replace_right_cell
          else
            flash_to_session
            javascript_redirect(previous_breadcrumb_url)
          end
        end
      end
    end
  end
end
