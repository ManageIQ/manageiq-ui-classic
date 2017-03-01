module ApplicationHelper
  module Title
    def product_title
      # TODO: leave I18n until we have productization capability in gettext
      I18n.t('product.name')
    end

    # Derive the browser title text based on the layout value
    def title_from_layout(layout)
      title = product_title

      if layout.blank?  # no layout, leave title alone
      elsif ["configuration", "dashboard", "chargeback", "about"].include?(layout)
        title += ": #{layout.titleize}"
      elsif @layout == "ems_cluster"
        title += ": #{title_for_clusters}"
      elsif @layout == "host"
        title += ": #{title_for_hosts}"
      # Specific titles for certain layouts
      elsif layout == "miq_server"
        title += _(": Servers")
      elsif layout == "usage"
        title += _(": VM Usage")
      elsif layout == "scan_profile"
        title += _(": Analysis Profiles")
      elsif layout == "miq_policy_rsop"
        title += _(": Policy Simulation")
      elsif layout == "all_ui_tasks"
        title += _(": All UI Tasks")
      elsif layout == "my_ui_tasks"
        title += _(": My UI Tasks")
      elsif layout == "rss"
        title += _(": RSS")
      elsif layout == "storage_manager"
        title += _(": Storage - Storage Managers")
      elsif layout == "ops"
        title += _(": Configuration")
      elsif layout == "provider_foreman"
        title += _(": Configuration Management")
      elsif layout == "pxe"
        title += _(": PXE")
      elsif layout == "explorer"
        title += ": #{controller_model_name(params[:controller])} Explorer"
      elsif layout == "vm_cloud"
        title += _(": Instances")
      elsif layout == "vm_infra"
        title += _(": Virtual Machines")
      elsif layout == "vm_or_template"
        title += _(": Workloads")
      # Specific titles for groups of layouts
      elsif layout.starts_with?("miq_ae_")
        title += _(": Automation")
      elsif layout.starts_with?("miq_policy")
        title += _(": Control")
      elsif layout.starts_with?("miq_capacity")
        title += _(": Optimize")
      elsif layout.starts_with?("miq_request")
        title += _(": Requests")
      elsif layout == "login"
        title += _(": Login")
      elsif layout == "manageiq/providers/ansible_tower/automation_manager/playbook"
        title += ": Playbooks (Ansible Tower)"
      elsif layout == "manageiq/providers/automation_manager/authentication"
        title += ": Credentials"
      elsif layout == "configuration_script_source"
        title += ": Repositories"
      # Assume layout is a table name and look up the plural version
      else
        title += ": #{ui_lookup(:tables => layout)}"
      end
      title
    end

  end
end
