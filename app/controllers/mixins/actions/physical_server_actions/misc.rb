module Mixins
  module Actions
    module PhysicalServerActions
      module Misc
        def process_physical_servers_refresh(physical_servers, task, display_name)
          PhysicalServer.refresh_ems(physical_servers)
          add_flash(n_("%{task} initiated for %{count} Physical Server from the %{product} Database",
                       "%{task} initiated for %{count} Physical Servers from the %{product} Database", physical_servers.length) % \
            {:task    => display_name,
             :product => I18n.t('product.name'),
             :count   => physical_servers.length})
          AuditEvent.success(:userid => session[:userid], :event => "physical_server_#{task}",
              :message => "'#{task_name(task)}' successfully initiated for #{pluralize(physical_servers.length, "PhysicalServer")}",
              :target_class => "PhysicalServer")
        end

        def process_physical_servers(physical_servers, task, display_name)
          physical_servers, _physical_servers_out_region = filter_ids_in_region(physical_servers, _("PhysicalServer"))
          return if physical_servers.empty?

          process_physical_servers_refresh(physical_servers, task, display_name) if task == 'refresh_ems'
        end

        # Refresh all selected or single displayed physical servers(s)
        def refresh_physical_servers
          assert_privileges("physical_server_refresh")
          physical_server_button_operation('refresh_ems', _('Refresh'))
        end

        def physical_server_button_operation(method, display_name)
          physical_servers = []

          # Either a list or coming from a different controller (eg from ems screen, go to its physical_servers)
          if @lastaction == "show_list" || @layout != "physical_server"
            physical_servers = find_checked_ids_with_rbac(PhysicalServer)
            if physical_servers.empty?
              add_flash(_("No Physical Servers were selected for %{task}") % {:task => display_name}, :error)
            else
              process_physical_servers(physical_servers, method, display_name)
            end

            if @lastaction == "show_list" # In physical server controller, refresh show_list, else let the other controller handle it
              show_list
              @refresh_partial = "layouts/gtl"
            end

          else # showing 1 physical server
            if params[:id].nil? || PhysicalServer.find_by(:id => params[:id]).nil?
              add_flash(_("Physical Server no longer exists"), :error)
            else
              physical_servers.push(find_id_with_rbac(PhysicalServer, params[:id]))
              process_physical_servers(physical_servers, method, display_name) unless physical_servers.empty?
            end

            params[:display] = @display
            show
          end
          javascript_flash
          physical_servers.count
        end
      end
    end
  end
end
