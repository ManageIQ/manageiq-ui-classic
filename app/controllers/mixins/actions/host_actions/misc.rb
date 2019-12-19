module Mixins
  module Actions
    module HostActions
      module Misc
        # Common handling of misc Host buttons

        def each_host(host_ids, task_name)
          Host.where(:id => host_ids).order('lower(name)').each do |host|
            yield host
          rescue StandardError => err
            add_flash(
              _("Host \"%{name}\": Error during '%{task}': %{message}") %
              {
                :name    => host.name,
                :task    => task_name,
                :message => err.message
              },
              :error
            )
          end
        end

        def process_hosts_refresh(hosts, task, display_name)
          Host.refresh_ems(hosts)
          add_flash(n_("%{task} initiated for %{count} Host from the %{product} Database",
                       "%{task} initiated for %{count} Hosts from the %{product} Database", hosts.length) % \
            {:task    => display_name,
             :product => Vmdb::Appliance.PRODUCT_NAME,
             :count   => hosts.length})
          AuditEvent.success(:userid => session[:userid], :event => "host_#{task}",
              :message => "'#{task_name(task)}' successfully initiated for #{pluralize(hosts.length, "Host")}",
              :target_class => "Host")
        end

        def process_hosts_destroy(hosts, display_name)
          each_host(hosts, display_name) do |host|
            validation = host.validate_destroy
            if !validation[:available]
              add_flash(validation[:message], :error)
            else
              audit = {:event        => "host_record_delete_initiated",
                       :message      => "[#{host.name}] Record delete initiated",
                       :target_id    => host.id,
                       :target_class => "Host",
                       :userid       => session[:userid]}
              AuditEvent.success(audit)
              host.destroy_queue
            end
          end
        end

        def process_hosts_scan(hosts, display_name)
          each_host(hosts, display_name) do |host|
            if host.respond_to?(:scan)
              host.send(:scan, session[:userid]) # Scan needs userid
              add_flash(_("\"%{record}\": %{task} successfully initiated") % {:record => host.name, :task => display_name})
            else
              add_flash(_("\"%{task}\": not supported for %{hostname}") % {:hostname => host.name, :task => display_name}, :error)
            end
          end
        end

        def process_hosts_maintenance(hosts, display_name)
          each_host(hosts, display_name) do |host|
            if host.maintenance
              if host.respond_to?(:unset_node_maintenance)
                host.send(:unset_node_maintenance_queue, session[:userid])
                add_flash(_("\"%{record}\": %{task} successfully initiated") % {:record => host.name, :task => display_name})
              else
                add_flash(_("\"%{task}\": not supported for %{hostname}") % {:hostname => host.name, :task => display_name}, :error)
              end
            elsif host.respond_to?(:set_node_maintenance)
              host.send(:set_node_maintenance_queue, session[:userid])
              add_flash(_("\"%{record}\": %{task} successfully initiated") % {:record => host.name, :task => display_name})
            else
              add_flash(_("\"%{task}\": not supported for %{hostname}") % {:hostname => host.name, :task => display_name}, :error)
            end
          end
        end

        def process_hosts_service_scheduling(hosts, display_name)
          each_host(hosts, disply_name) do |host|
            params[:miq_grid_checks].split(",").each do |cloud_service_id|
              service = host.cloud_services.find(cloud_service_id)
              if service.validate_enable_scheduling
                resp = service.enable_scheduling
                status = resp.body.fetch("service").fetch("status")
                service.update(:scheduling_disabled => status == 'disabled')
                add_flash(_("\"%{record}\": Scheduling is %{status} now.") % {:record => service.name, :status => status})
              elsif service.validate_disable_scheduling
                resp = service.disable_scheduling
                status = resp.body.fetch("service").fetch("status")
                service.update(:scheduling_disabled => status == 'disabled')
                add_flash(_("\"%{record}\": Scheduling is %{status} now.") % {:record => service.name, :status => status})
              else
                add_flash(_("\"%{record}\": %{task} invalid") % {:record => service.name, :task => display_name}, :error)
              end
            end
          end
        end

        def process_hosts_manageable(hosts, display_name)
          each_host(hosts, display_name) do |host|
            if %w[enroll available adoptfail inspectfail cleanfail].include?(host.hardware.provision_state)
              host.manageable_queue(session[:userid])
              add_flash(_("\"%{record}\": %{task} successfully initiated") % {:record => host.name, :task => display_name})
            else
              add_flash(_("\"%{task}\": not available for %{hostname}. %{hostname}'s provision state must be in \"available\", \"adoptfail\", \"cleanfail\", \"enroll\", or \"inspectfail\"") % {:hostname => host.name, :task => display_name}, :error)
            end
          end
        end

        def process_hosts_introspect(hosts, display_name)
          each_host(hosts, display_name) do |host|
            if host.hardware.provision_state == "manageable"
              host.introspect_queue(session[:userid])
              add_flash(_("\"%{record}\": %{task} successfully initiated") % {:record => host.name, :task => display_name})
            else
              add_flash(_("\"%{task}\": not available for %{hostname}. %{hostname}'s provision state needs to be in \"manageable\"") % {:hostname => host.name, :task => display_name}, :error)
            end
          end
        end

        def process_hosts_provide(hosts, display_name)
          each_host(hosts, display_name) do |host|
            if host.hardware.provision_state == "manageable"
              host.provide_queue(session[:userid])
              add_flash(_("\"%{record}\": %{task} successfully initiated") % {:record => host.name, :task => display_name})
            else
              add_flash(_("\"%{task}\": not available for %{hostname}. %{hostname}'s provision state needs to be in \"manageable\"") % {:hostname => host.name, :task => display_name}, :error)
            end
          end
        end

        def process_hosts_generic(hosts, task, display_name)
          each_host(hosts, display_name) do |host|
            if host.respond_to?(task) && host.is_available?(task)
              host.send(task.to_sym)
              add_flash(_("\"%{record}\": %{task} successfully initiated") % {:record => host.name, :task => display_name})
            else
              add_flash(_("\"%{task}\": not available for %{hostname}") % {:hostname => host.name, :task => display_name}, :error)
            end
          end
        end

        # Common Host button handler routines
        def process_hosts(hosts, task, display_name = nil)
          hosts, _hosts_out_region = filter_ids_in_region(hosts, _("Host"))
          return if hosts.empty?

          display_name ||= task

          case task
          when 'refresh_ems'        then process_hosts_refresh(hosts, task, display_name)
          when 'destroy'            then process_hosts_destroy(hosts, display_name)
          when 'scan'               then process_hosts_scan(hosts, display_name)
          when 'maintenance'        then process_hosts_maintenance(hosts, display_name)
          when 'service_scheduling' then process_hosts_service_scheduling(hosts, display_name)
          when 'manageable'         then process_hosts_manageable(hosts, display_name)
          when 'introspect'         then process_hosts_introspect(hosts, display_name)
          when 'provide'            then process_hosts_provide(hosts, display_name)
          else                           process_hosts_generic(hosts, task, display_name)
          end
        end

        # Refresh all selected or single displayed host(s)
        def refreshhosts
          assert_privileges("host_refresh")
          host_button_operation('refresh_ems', _('Refresh'))
        end

        # Scan all selected or single displayed host(s)
        def scanhosts
          assert_privileges("host_scan")
          host_button_operation('scan', _('Analysis'))
        end

        # Toggle maintenance mode on all selected or single displayed host(s)
        def maintenancehosts
          assert_privileges("host_toggle_maintenance")
          host_button_operation('maintenance', _('Toggle Maintenance'))
        end

        # Toggle Scheduling on all selected or single displayed Cloud Service
        def toggleservicescheduling
          assert_privileges("host_cloud_service_scheduling_toggle")
          host_button_operation('service_scheduling', _('Toggle Scheduling for Cloud Service'))
        end

        def check_compliance_hosts
          assert_privileges("host_check_compliance")
          host_button_operation('check_compliance_queue', _('Compliance Check'))
        end

        def analyze_check_compliance_hosts
          assert_privileges("host_analyze_check_compliance")
          host_button_operation('scan_and_check_compliance_queue', _('Analyze and Compliance Check'))
        end

        # Set host to manageable state
        def sethoststomanageable
          assert_privileges("host_manageable")
          host_button_operation('manageable', _('Manageable'))
        end

        # Introspect host hardware
        def introspecthosts
          assert_privileges("host_introspect")
          host_button_operation('introspect', _('Introspect'))
        end

        # Provide host hardware, moving them to available state
        def providehosts
          assert_privileges("host_provide")
          host_button_operation('provide', _('Provide'))
        end

        def host_button_operation(method, display_name)
          hosts = find_records_with_rbac(Host, checked_or_params).ids
          process_hosts(hosts, method, display_name)

          # Either a list or coming from a different controller (eg from ems screen, go to its hosts)
          if @lastaction == "show_list" || @layout != "host"
            if @lastaction == "show_list" # In host controller, refresh show_list, else let the other controller handle it
              show_list
              @refresh_partial = "layouts/gtl"
            end
          else # showing 1 host
            params[:display] = @display
            show
            # TODO: tells callers to go back to show_list because this Host may be gone
            # Should be refactored into calling show_list right here
            if method == 'destroy'
              @single_delete = true unless flash_errors?
            end

            @refresh_partial = @display == "vms" ? "layouts/gtl" : "config"
          end

          hosts.count
        end
      end
    end
  end
end
