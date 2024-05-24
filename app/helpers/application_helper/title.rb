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
    # FIXME: don't do that in the first place
    def title_from_layout(layout)
      # no layout, leave title alone
      return nil if layout.blank?

      case layout
      when "automation_manager"
        _("Automation Managers")
      when "catalogs"
        _("Catalogs")
      when "configuration"
        _("My Settings")
      when "configuration_job"
        _("Configuration Jobs")
      when "container_dashboard"
        _("Container Dashboard")
      when "dashboard"
        _("Dashboard")
      when "chargeback"
        _("Chargeback")
      when "about"
        _("About")
      when "ems_cluster"
        _("Clusters")
      when "generic_object_definition"
        _("Generic Object Definitions")
      when "host"
        _("Hosts")
      when "miq_server"
        _("Servers")
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
      when /^miq_capacity_utilization/
        _("Utilization")
      when /^miq_request/
        _("Requests")
      when "configuration_script"
        _("Templates")
      when "manageiq/providers/ansible_tower/automation_manager/playbook"
        _("Playbooks (Ansible Tower)")
      when "manageiq/providers/embedded_ansible/automation_manager/playbook"
        _("Playbooks")
      when "manageiq/providers/embedded_ansible/automation_manager/credential", "manageiq/providers/workflows/automation_manager/credential", "manageiq/providers/embedded_terraform/automation_manager/credential"
        _("Credentials")
      when "manageiq/providers/embedded_ansible/automation_manager/configuration_script_source", "manageiq/providers/workflows/automation_manager/configuration_script_source", "manageiq/providers/embedded_terraform/automation_manager/configuration_script_source"
        _("Repositories")
      when "manageiq/providers/workflows/automation_manager/workflow"
        _("Workflows")
      when "manageiq/providers/embedded_terraform/automation_manager/template"
        _("Templates")

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
  end
end
