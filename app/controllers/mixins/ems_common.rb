module Mixins
  module EmsCommon
    extend ActiveSupport::Concern

    # This is the list of extracted parts that can be used separately
    include Core
    include Metrics
    include PauseResume

    included do
      include Mixins::GenericSessionMixin
      include Mixins::MoreShowActions

      # This is a temporary hack ensuring that @ems will be set.
      # Once we use @record in place of @ems, this can be removed
      # together with init_show_ems
      alias_method :init_show_generic, :init_show
      alias_method :init_show, :init_show_ems

      helper_method :textual_group_list
      private :textual_group_list
    end

    def init_show_ems
      result = init_show_generic
      @ems = @record
      result
    end

    def textual_group_list
      [
        %i[properties status],
        %i[compliance relationships topology smart_management]
      ]
    end

    def show_props
      drop_breadcrumb(:name => @ems.name + _(" (Properties)"), :url => show_link(@ems, :display => "props"))
    end

    def show_ad_hoc_metrics
      @showtype = "ad_hoc_metrics"
      @lastaction = "show_ad_hoc_metrics"
      drop_breadcrumb(:name => @ems.name + _(" (Ad hoc Metrics)"), :url => show_link(@ems))
    end

    def display_block_storage_managers
      nested_list(ManageIQ::Providers::StorageManager, :parent_method => :block_storage_managers, :breadcrumb_title => _('Block Storage Managers'))
    end

    def display_object_storage_managers
      nested_list(ManageIQ::Providers::StorageManager, :parent_method => :object_storage_managers, :breadcrumb_title => _('Object Storage Managers'))
    end

    def display_storage_managers
      nested_list(ManageIQ::Providers::StorageManager, :parent_method => :storage_managers)
    end

    def display_ems_clusters
      nested_list(EmsCluster, :breadcrumb_title => title_for_clusters)
    end

    def display_persistent_volumes
      nested_list(PersistentVolume, :parent_method => :persistent_volumes)
    end

    def display_hosts
      nested_list(Host, :breadcrumb_title => _('Managed Hosts'))
    end

    class_methods do
      def display_methods
        %w[
          availability_zones
          block_storage_managers
          cloud_networks
          cloud_object_store_containers
          cloud_subnets
          cloud_tenants
          cloud_volumes
          cloud_volume_snapshots
          cloud_volume_backups
          cloud_volume_types
          configuration_jobs
          container_builds
          container_groups
          container_image_registries
          container_images
          container_nodes
          container_projects
          container_replicators
          container_routes
          containers
          container_services
          container_templates
          custom_button_events
          ems_clusters
          flavors
          floating_ips
          host_aggregates
          hosts
          images
          instances
          middleware_deployments
          middleware_domains
          middleware_server_groups
          middleware_servers
          miq_templates
          network_ports
          network_routers
          object_storage_managers
          orchestration_stacks
          persistent_volumes
          physical_servers
          physical_racks
          physical_chassis
          physical_servers_with_host
          physical_switches
          physical_storages
          security_groups
          storage_managers
          storages
          vms
        ]
      end

      def custom_display_modes
        %w[props ad_hoc_metrics]
      end

      def default_show_template
        "shared/views/ems_common/show"
      end
    end


    def new
      assert_privileges("#{permission_prefix}_new")
      @ems = model.new
      set_form_vars
      @in_a_form = true
      session[:changed] = nil
      drop_breadcrumb(:name => _("Add New %{table}") % {:table => ui_lookup(:table => table_name)},
                      :url  => "/#{controller_name}/new")
    end

    def edit
      assert_privileges("#{permission_prefix}_edit")
      begin
        @ems = find_record_with_rbac(model, params[:id])
      rescue => err
        return redirect_to(:action      => @lastaction || "show_list",
                           :flash_msg   => err.message,
                           :flash_error => true)
      end
      if respond_to?(:model_feature_for_action) && !@ems.supports?(model_feature_for_action(:edit))
        flash_to_session(_("Edit of %{object_type} %{object_name} is not supported.") % {
          :object_type => ui_lookup(:model => model.to_s),
          :object_name => @ems.name
        }, :error)
        return redirect_to(:action => @lastaction || "show_list")
      end
      set_form_vars
      @in_a_form = true
      session[:changed] = false
      drop_breadcrumb(:name => _("Edit %{object_type} '%{object_name}'") % {:object_type => ui_lookup(:tables => table_name), :object_name => @ems.name},
                      :url  => "/#{controller_name}/#{@ems.id}/edit")
    end

    def timeline_pressed
      @record = find_record_with_rbac(model, params[:id])
      session[:tl_record_id] = @record.id
      javascript_redirect(polymorphic_path(@record, :display => 'timeline'))
    end

    def performance_pressed
      @showtype = "performance"
      @record = find_record_with_rbac(model, params[:id])
      drop_breadcrumb(:name => _("%{name} Capacity & Utilization") % {:name => @record.name},
                      :url  => show_link(@record, :refresh => "n", :display => "performance"))
      perf_gen_init_options # Intialize options, charts are generated async
      javascript_redirect(polymorphic_path(@record, :display => "performance"))
    end

    def ad_hoc_metrics_pressed
      @showtype = "ad_hoc_metrics"
      @record = find_record_with_rbac(model, params[:id])
      drop_breadcrumb(:name => @record.name + _(" (Ad hoc Metrics)"), :url => show_link(@record))
      javascript_redirect(polymorphic_path(@record, :display => "ad_hoc_metrics"))
    end

    # provider_id can be either a provider id or a storage manager id, depending on context
    # this method figures the block_storage_manager_id.
    def block_storage_manager_id(provider_id)
      manager = find_record_with_rbac(ExtManagementSystem, provider_id)
      return nil unless manager
      return manager.id unless manager.respond_to?(:storage_managers)
      manager.storage_managers.detect(&:supports_block_storage?)&.id
    end

    # handle buttons pressed on the button bar
    def button
      @edit = session[:edit]                                  # Restore @edit for adv search box

      params[:display] = @display if ["vms", "hosts", "storages", "instances", "images", "orchestration_stacks"].include?(@display)  # Were we displaying vms/hosts/storages
      params[:page] = @current_page unless @current_page.nil?   # Save current page for list refresh

      # Handle buttons from sub-items screen
      if params[:pressed].starts_with?("availability_zone_",
                                       "cloud_network_",
                                       "cloud_subnet_",
                                       "cloud_tenant_",
                                       "cloud_volume_",
                                       "ems_cluster_",
                                       "flavor_",
                                       "floating_ip_",
                                       "guest_",
                                       "host_",
                                       "image_",
                                       "instance_",
                                       "load_balancer_",
                                       "miq_template_",
                                       "network_port_",
                                       "network_router_",
                                       "orchestration_stack_",
                                       "security_group_",
                                       "storage_",
                                       "vm_",
                                       "physical_server_")

        case params[:pressed]
        # Clusters
        when "ems_cluster_compare"              then comparemiq
        when "ems_cluster_delete"               then deleteclusters
        when "ems_cluster_protect"              then assign_policies(EmsCluster)
        when "ems_cluster_scan"                 then scanclusters
        when "ems_cluster_tag"                  then tag(EmsCluster)
        # Flavor
        when 'flavor_create'                    then javascript_redirect(:action => 'new')
        when 'flavor_delete'                    then delete_flavors
        # Hosts
        when "host_analyze_check_compliance"    then analyze_check_compliance_hosts
        when "host_check_compliance"            then check_compliance_hosts
        when "host_compare"                     then comparemiq
        when "host_delete"                      then deletehosts
        when "host_edit"                        then edit_record
        when "host_protect"                     then assign_policies(Host)
        when "host_refresh"                     then refreshhosts
        when "host_scan"                        then scanhosts
        when "host_tag"                         then tag(Host)
        when "host_manageable"                  then sethoststomanageable
        when "host_introspect"                  then introspecthosts
        when "host_provide"                     then providehosts
        # Host Aggregates
        when 'host_aggregate_new'               then javascript_redirect(:action => 'new')
        when 'host_aggregate_edit'              then javascript_redirect(:action => 'edit', :id => checked_or_params, :controller => 'host_aggregate')
        when 'host_aggregate_delete'            then javascript_redirect(:action => 'delete_host_aggregates', :id => params[:id], :miq_grid_checks => params[:miq_grid_checks], :controller => 'host_aggregate')
        when 'host_aggregate_add_host'          then javascript_redirect(:action => 'add_host_select', :id => checked_or_params, :controller => 'host_aggregate')
        when 'host_aggregate_remove_host'       then javascript_redirect(:action => 'remove_host_select', :id => checked_or_params, :controller => 'host_aggregate')
        when 'host_aggregate_tag'               then tag(HostAggregate)
        # Storages
        when "storage_delete"                   then deletestorages
        when "storage_scan"                     then scanstorage
        when "storage_tag"                      then tag(Storage)
        # Edit Tags for Network Manager Relationship pages
        when "availability_zone_tag"            then tag(AvailabilityZone)
        when "cloud_network_tag"                then tag(CloudNetwork)
        when "cloud_subnet_tag"                 then tag(CloudSubnet)
        when "cloud_tenant_tag"                 then tag(CloudTenant)
        when "cloud_volume_tag"                 then tag(CloudVolume)
        when "flavor_tag"                       then tag(Flavor)
        when "floating_ip_tag"                  then tag(FloatingIp)
        when "load_balancer_tag"                then tag(LoadBalancer)
        when "network_port_tag"                 then tag(NetworkPort)
        when "network_router_tag"               then tag(NetworkRouter)
        when "orchestration_stack_tag"          then tag(OrchestrationStack)
        when "security_group_tag"               then tag(SecurityGroup)

        when "physical_server_protect"          then assign_policies(PhysicalServer)
        when "physical_server_tag"              then tag(PhysicalServer)
        when "orchestration_stack_delete"       then orchestration_stack_delete
        end

        return if params[:pressed].include?("tag") && !%w[host_tag vm_tag miq_template_tag instance_tag image_tag].include?(params[:pressed])
        if params[:pressed].include?("orchestration_stack_delete")
          flash_to_session
          javascript_redirect(polymorphic_path(EmsCloud.find(params[:id]), :display => 'orchestration_stacks'))
          return
        end
        pfx = pfx_for_vm_button_pressed(params[:pressed])
        # Handle Host power buttons
        if host_power_button?(params[:pressed])
          handle_host_power_button(params[:pressed])
        else
          process_vm_buttons(pfx)
          # Control transferred to another screen, so return
          return if ["host_tag", "#{pfx}_policy_sim", "host_scan", "host_refresh", "host_protect",
                     "host_compare", "#{pfx}_compare", "#{pfx}_tag", "#{pfx}_retire",
                     "#{pfx}_protect", "#{pfx}_ownership", "#{pfx}_refresh", "#{pfx}_right_size",
                     "#{pfx}_reconfigure", "storage_tag", "ems_cluster_compare",
                     "ems_cluster_protect", "ems_cluster_tag", "#{pfx}_resize", "#{pfx}_live_migrate",
                     "#{pfx}_evacuate"].include?(params[:pressed]) &&
                    @flash_array.nil?

          unless ["host_edit", 'host_aggregate_edit', 'host_aggregate_add_host', 'host_aggregate_remove_host', 'host_aggregate_delete', "#{pfx}_edit", "#{pfx}_miq_request_new",
                  "#{pfx}_clone", "#{pfx}_migrate", "#{pfx}_publish", 'vm_rename', 'flavor_create', 'flavor_delete'].include?(params[:pressed])
            @refresh_div = "main_div"
            @refresh_partial = "layouts/gtl"
            show                                                        # Handle EMS buttons
          end
        end
      elsif params[:pressed].starts_with?("cloud_object_store_")
        case params[:pressed]
        when "cloud_object_store_container_new"
          return javascript_redirect(:controller => "cloud_object_store_container", :action => "new",
                                     :storage_manager_id => params[:id])
        else
          process_cloud_object_storage_buttons(params[:pressed])
        end
      else
        @refresh_div = "main_div" # Default div for button.rjs to refresh

        case params[:pressed]
        when 'new'
          redirect_to(:action => 'new')
        when "#{table_name}_delete"
          deleteemss
        when "#{table_name}_refresh"
          refresh_or_capture_emss("refresh_ems", _("Refresh"))
        when "#{table_name}_capture_metrics"
          refresh_or_capture_emss("capture_ems", _("Capture Metrics"))
        when "#{table_name}_pause"
          pause_or_resume_emss(:pause => true)
        when "#{table_name}_resume"
          pause_or_resume_emss(:resume => true)
        when "#{table_name}_tag"
          tag(model)
        when "#{table_name}_protect"
          assign_policies(model)
        when "#{table_name}_check_compliance"
          check_compliance(model)
        when "#{table_name}_edit"
          edit_record
        when "#{table_name}_timeline"
          timeline_pressed
          return
        when "#{table_name}_perf"
          performance_pressed
          return
        when "#{table_name}_ad_hoc_metrics"
          ad_hoc_metrics_pressed
          return
        when 'refresh_server_summary'
          javascript_redirect :back
          return
        end

        if @display && @display != 'main'
          model_class = @display.camelize.singularize.safe_constantize
          display_s = @display.singularize

          case params[:pressed]
          when "#{display_s}_tag"
            tag(model_class)
          when "#{display_s}_protect"
            assign_policies(model_class)
          when "#{display_s}_check_compliance"
            check_compliance_nested(model_class)
            return
          end
        end

        if params[:pressed] == "ems_cloud_recheck_auth_status"          ||
           params[:pressed] == "ems_infra_recheck_auth_status"          ||
           params[:pressed] == "ems_physical_infra_recheck_auth_status" ||
           params[:pressed] == "ems_middleware_recheck_auth_status"     ||
           params[:pressed] == "ems_container_recheck_auth_status"
          if params[:id]
            table_key = :table
            _result, details = recheck_authentication
            add_flash(_("Re-checking Authentication status for this %{controller_name} was not successful: %{details}") %
                          {:controller_name => ui_lookup(:table => controller_name), :details => details}, :error) if details
          else
            table_key = :tables
            ems_ids = find_checked_items
            ems_ids.each do |ems_id|
              _result, details = recheck_authentication(ems_id)
              add_flash(_("Re-checking Authentication status for the selected %{controller_name} %{name} was not successful: %{details}") %
                            {:controller_name => ui_lookup(:table => controller_name),
                             :name            => @record.name,
                             :details         => details}, :error) if details
            end
          end
          add_flash(_("Authentication status will be saved and workers will be restarted for the selected %{controller_name}") %
                        {:controller_name => ui_lookup(table_key => controller_name)})
          render_flash
          return
        end

        custom_buttons if params[:pressed] == "custom_button"

        return if ["custom_button"].include?(params[:pressed])    # custom button screen, so return, let custom_buttons method handle everything
        return if ["#{table_name}_tag", "#{display_s}_tag", "#{table_name}_protect", "#{display_s}_protect", "#{table_name}_timeline"].include?(params[:pressed]) &&
                  @flash_array.nil? # Screen for Edit Tags or Manage Policies action showing, so return

        check_if_button_is_implemented
      end

      if single_delete_test
        single_delete_redirect
      elsif params[:pressed] == "cloud_tenant_edit"
        javascript_redirect :controller => "cloud_tenant",
                            :action     => "edit",
                            :id         => find_record_with_rbac(CloudTenant, checked_or_params)
      elsif params[:pressed] == "cloud_volume_new"
        javascript_redirect :controller         => "cloud_volume",
                            :action             => "new",
                            :storage_manager_id => block_storage_manager_id(params[:id])
      elsif params[:pressed] == "cloud_volume_snapshot_create"
        javascript_redirect :controller => "cloud_volume",
                            :action     => "snapshot_new",
                            :id         => find_record_with_rbac(CloudVolume, checked_or_params)
      elsif params[:pressed] == "cloud_volume_attach"
        javascript_redirect :controller => "cloud_volume",
                            :action     => "attach",
                            :id         => find_record_with_rbac(CloudVolume, checked_or_params)
      elsif params[:pressed] == "cloud_volume_detach"
        javascript_redirect :controller => "cloud_volume",
                            :action     => "detach",
                            :id         => find_record_with_rbac(CloudVolume, checked_or_params)
      elsif params[:pressed] == "cloud_volume_edit"
        javascript_redirect :controller => "cloud_volume",
                            :action     => "edit",
                            :id         => find_record_with_rbac(CloudVolume, checked_or_params)
      elsif params[:pressed] == "cloud_volume_delete"
        # Clear CloudVolumeController's lastaction, since we are calling the delete_volumes from
        # an external controller. This will ensure that the final redirect is properly handled.
        session["#{CloudVolumeController.session_key_prefix}_lastaction".to_sym] = nil
        javascript_redirect :controller      => "cloud_volume",
                            :action          => "delete_volumes",
                            :miq_grid_checks => params[:miq_grid_checks]
      elsif params[:pressed] == "network_router_edit"
        javascript_redirect :controller => "network_router",
                            :action     => "edit",
                            :id         => find_record_with_rbac(NetworkRouter, checked_or_params)
      elsif params[:pressed] == "network_router_add_interface"
        javascript_redirect :controller => "network_router",
                            :action     => "add_interface_select",
                            :id         => find_record_with_rbac(NetworkRouter, checked_or_params)
      elsif params[:pressed] == "network_router_remove_interface"
        javascript_redirect :controller => "network_router",
                            :action     => "remove_interface_select",
                            :id         => find_record_with_rbac(NetworkRouter, checked_or_params)
      elsif params[:pressed] == 'ems_infra_change_password'
        javascript_redirect(change_password_ems_physical_infra_path(checked_or_params.first))
      elsif params[:pressed].ends_with?("_edit") ||
            ["#{pfx}_miq_request_new", "#{pfx}_clone", "#{pfx}_migrate", "#{pfx}_publish"].include?(params[:pressed]) ||
            params[:pressed] == 'vm_rename' && @flash_array.nil?
        render_or_redirect_partial(pfx) unless performed?
      else
        if @refresh_div == "main_div" && @lastaction == "show_list"
          replace_gtl_main_div
        else
          render_flash unless performed?
        end
      end
    end

    def recheck_authentication(id = nil)
      @record = find_record_with_rbac(model, id || params[:id])
      @record.authentication_check_types_queue(@record.authentication_for_summary.pluck(:authtype), :save => true)
    end

    def check_compliance(model)
      showlist = @lastaction == "show_list"
      ids = find_records_with_rbac(model, checked_or_params).ids
      process_emss(ids, "check_compliance")
      params[:display] = "main"
      return if @display == 'dashboard'
      showlist ? show_list : show
    end

    private ############################

    # Check compliance of Last Known Configuration for items displayed in nested lists
    def check_compliance_nested(model)
      assert_privileges("#{model.name.underscore}_check_compliance")
      ids = find_records_with_rbac(model, checked_or_params).ids
      process_check_compliance(model, ids)
      @lastaction == 'show_list' ? show_list : show
      ids.count
    end

    def process_check_compliance(model, ids)
      model.where(:id => ids).order("lower(name)").each do |entity|
        begin
          entity.check_compliance
        rescue StandardError => bang
          add_flash(_("%{model} \"%{name}\": Error during 'Check Compliance': %{error}") %
                     {:model => ui_lookup(:model => model.to_s),
                      :name  => entity.name,
                      :error => bang.message},
                    :error) # Push msg and error flag
        else
          add_flash(_("\"%{record}\": Compliance check successfully initiated") % {:record => entity.name})
        end
      end
      javascript_flash
    end

    # Set form variables for edit
    def set_form_vars
      form_instance_vars
    end

    def form_instance_vars
      @server_zones = []
      zones = Zone.visible.order('lower(description)')
      zones.each do |zone|
        @server_zones.push([zone.description, zone.name])
      end
      @ems_types = Array(model.supported_types_and_descriptions_hash.invert).sort_by(&:first)

      @provider_regions = retrieve_provider_regions
      @openstack_infra_providers = retrieve_openstack_infra_providers
      @openstack_security_protocols = retrieve_openstack_security_protocols
      @amqp_security_protocols = retrieve_amqp_security_protocols
      @nuage_security_protocols = retrieve_nuage_security_protocols
      @container_security_protocols = retrieve_container_security_protocols
      @scvmm_security_protocols = [[_('Basic (SSL)'), 'ssl'], ['Kerberos', 'kerberos']]
      @openstack_api_versions = retrieve_openstack_api_versions
      @vmware_cloud_api_versions = retrieve_vmware_cloud_api_versions
      @azure_stack_api_versions = retrieve_azure_stack_api_versions
      @emstype_display = model.supported_types_and_descriptions_hash[@ems.emstype]
      if @ems.respond_to?(:description)
        @ems_region_display = @ems.description
      end
      @nuage_api_versions = retrieve_nuage_api_versions
      @hawkular_security_protocols = retrieve_hawkular_security_protocols
      @redfish_security_protocols = retrieve_security_protocols
    end

    def retrieve_provider_regions
      managers = model.supported_subclasses.select(&:supports_regions?)
      managers.each_with_object({}) do |manager, provider_regions|
        regions = manager.parent::Regions.all.sort_by { |r| r[:description] }
        provider_regions[manager.ems_type] = regions.map do |region|
          [region[:description], region[:name]]
        end
      end
    end
    private :retrieve_provider_regions

    def retrieve_openstack_infra_providers
      ManageIQ::Providers::Openstack::Provider.pluck(:name, :id)
    end

    def retrieve_openstack_api_versions
      [['Keystone v2', 'v2'], ['Keystone v3', 'v3']]
    end

    def retrieve_vmware_cloud_api_versions
      [['vCloud API 5.1', '5.1'], ['vCloud API 5.5', '5.5'], ['vCloud API 5.6', '5.6'], ['vCloud API 9.0', '9.0']]
    end

    def retrieve_nuage_api_versions
      [['Version 3.2', 'v3_2'], ['Version 4.0', 'v4_0'], ['Version 5.0', 'v5.0']]
    end

    def retrieve_azure_stack_api_versions
      [['2017-03-09 Profile', 'V2017_03_09'], ['2018-03-01 Profile', 'V2018_03_01']]
    end

    def retrieve_security_protocols
      [[_('SSL without validation'), 'ssl'], [_('SSL'), 'ssl-with-validation'], [_('Non-SSL'), 'non-ssl']]
    end

    def retrieve_openstack_security_protocols
      retrieve_security_protocols
    end

    def retrieve_nuage_security_protocols
      retrieve_security_protocols
    end

    def retrieve_amqp_security_protocols
      # OSP8 doesn't support SSL for AMQP
      [[_('Non-SSL'), 'non-ssl']]
    end

    def retrieve_container_security_protocols
      [[_('SSL'), 'ssl-with-validation'],
       [_('SSL trusting custom CA'), 'ssl-with-validation-custom-ca'],
       [_('SSL without validation'), 'ssl-without-validation']]
    end

    def retrieve_hawkular_security_protocols
      [[_('SSL'), 'ssl-with-validation'],
       [_('SSL trusting custom CA'), 'ssl-with-validation-custom-ca'],
       [_('SSL without validation'), 'ssl-without-validation'],
       [_('Non-SSL'), 'non-ssl']]
    end

    # Delete all selected or single displayed ems(s)
    def deleteemss
      assert_privileges(params[:pressed])
      emss = []
      if @lastaction == "show_list" # showing a list, scan all selected emss
        emss = find_checked_items
        if emss.empty?
          add_flash(_("No %{record} were selected for deletion") % {:record => ui_lookup(:table => table_name)}, :error)
        end
        process_emss(emss, "destroy") unless emss.empty?
        add_flash(n_("Delete initiated for %{count} %{model} from the %{product} Database",
                     "Delete initiated for %{count} %{models} from the %{product} Database", emss.length) %
          {:count   => emss.length,
           :product => Vmdb::Appliance.PRODUCT_NAME,
           :model   => ui_lookup(:table => table_name),
           :models  => ui_lookup(:tables => table_name)}) if @flash_array.nil?
      else # showing 1 ems, scan it
        if params[:id].nil? || model.find_by_id(params[:id]).nil?
          add_flash(_("%{record} no longer exists") % {:record => ui_lookup(:table => table_name)}, :error)
        else
          emss.push(params[:id])
        end
        process_emss(emss, "destroy") unless emss.empty?
        @single_delete = true unless flash_errors?
        add_flash(_("The selected %{record} was deleted") %
          {:record => ui_lookup(:tables => table_name)}) if @flash_array.nil?
      end
      if @lastaction == "show_list"
        show_list
        @refresh_partial = "layouts/gtl"
      end
    end
  end
end
