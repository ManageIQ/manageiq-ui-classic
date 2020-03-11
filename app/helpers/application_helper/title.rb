module ApplicationHelper
  module Title
    def productized_title(title)
      if title.present?
        "%{product}: %{title}" % {:product => product_title, :title => title}
      else
        product_title
      end
    end

    def product_title
      Vmdb::Appliance.PRODUCT_NAME
    end

    def page_title
      productized_title(@page_title.presence || title_from_layout(@layout))
    end

    # Derive the browser title text based on the layout value
    def title_from_layout(layout)
      # no layout, leave title alone
      return nil if layout.blank?

      case layout
      when "automation_manager"
        _("Automation Managers")
      when "catalogs"
        _("Catalogs")
      when "cloud_topology"
        _("Cloud Topology")
      when "configuration"
        _("My Settings")
      when "configuration_job"
        _("Configuration Jobs")
      when "container_dashboard"
        _("Container Dashboard")
      when "container_topology"
        _("Container Topology")
      when "dashboard"
        _("Dashboard")
      when "chargeback"
        _("Chargeback")
      when "about"
        _("About")
      when "ems_cluster"
        title_for_clusters
      when "generic_object_definition"
        _("Generic Object Definitions")
      when "host"
        title_for_hosts
      when "infra_topology"
        _("Infrastructure Topology")
      when "miq_server"
        _("Servers")
      when "monitor_alerts_list"
        _("Monitor Alerts")
      when "monitor_alerts_most_recent"
        _("Most Recent Monitor Alerts")
      when "monitor_alerts_overview"
        _("Monitor Alerts Overview")
      when "network_topology"
        _("Network Topology")
      when "physical_infra_topology"
        _("Physical Infrastructure Topology")
      when "services"
        _("Services")
      when "usage"
        _("VM Usage")
      when "scan_profile"
        _("Analysis Profiles")
      when "miq_policy_rsop"
        _("Policy Simulation")
      when "report"
        _("Reports")
      when "ops"
        _("Configuration")
      when "configuration_manager"
        _("Configuration Management")
      when "pxe"
        _("PXE")
      when "switch"
        _("Switches")
      when "explorer"
        "#{controller_model_name(params[:controller])} Explorer"
      when "timeline"
        _("Timelines")
      when "vm_cloud"
        _("Instances")
      when "vm_infra"
        _("Virtual Machines")
      when "vm_or_template"
        _("Workloads")
      when "all_tasks"
        _("All Tasks")
      when "my_tasks"
        _("My Tasks")

      # Specific titles for groups of layouts
      when /^miq_ae_/
        _("Automation")
      when /^miq_policy/
        _("Control")
      when /^miq_capacity_utilization/
        _("Utilization")
      when /^miq_request/
        _("Requests")
      when "manageiq/providers/ansible_tower/automation_manager/playbook"
        _("Playbooks (Ansible Tower)")
      when "manageiq/providers/embedded_ansible/automation_manager/playbook"
        _("Playbooks")
      when "manageiq/providers/embedded_automation_manager/authentication"
        _("Credentials")
      when "manageiq/providers/embedded_automation_manager/configuration_script_source"
        _("Repositories")

      else
        fallback_title(layout)
      end
    end

    def fallback_title(layout)
      # Check if the item comes from menu, if so, use the name as title.
      # This is used for custom menu items.
      menu_item = Menu::Manager.items.find { |i| i.id == layout }
      return _(menu_item.name) if menu_item

      # Assume layout is a table name and look up the plural version
      ui_lookup(:tables => layout)
    end

    def title_for_hosts
      title_for_host(true)
    end

    def title_for_host(plural = false)
      case Host.node_types
      when :non_openstack
        plural ? _("Hosts") : _("Host")
      when :openstack
        plural ? _("Nodes") : _("Node")
      else
        plural ? _("Hosts / Nodes") : _("Host / Node")
      end
    end

    def title_for_clusters
      title_for_cluster(true)
    end

    def title_for_cluster(plural = false)
      case EmsCluster.node_types
      when :non_openstack
        plural ? _("Clusters") : _("Cluster")
      when :openstack
        plural ? _("Deployment Roles") : _("Deployment Role")
      else
        plural ? _("Clusters / Deployment Roles") : _("Cluster / Deployment Role")
      end
    end

    def title_for_managers
      _("Managers")
    end

    def title_for_providers
      _("Providers")
    end

    def title_for_datastores
      _("Datastores")
    end
  end
end
