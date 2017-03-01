module ApplicationHelper
  module Title
    def productized_title(title)
      product_title + title
    end

    def product_title
      # TODO: leave I18n until we have productization capability in gettext
      I18n.t('product.name')
    end

    def page_title
      @page_title.present? ? productized_title(@page_title) : title_from_layout(@layout)
    end

    # Derive the browser title text based on the layout value
    def title_from_layout(layout)
      title = product_title

      return title if layout.blank?  # no layout, leave title alone

      title + case layout
              when "configuration"
                _(": Configuration")
              when "dashboard"
                _(": Dashboard")
              when "chargeback"
                _(": Chargeback")
              when "about"
                _(": About")
              when "ems_cluster"
                ": #{title_for_clusters}"
              when "host"
                ": #{title_for_hosts}"

              # Specific titles for certain layouts
              when "miq_server"
                _(": Servers")
              when "usage"
                _(": VM Usage")
              when "scan_profile"
                _(": Analysis Profiles")
              when "miq_policy_rsop"
                _(": Policy Simulation")
              when "all_ui_tasks"
                _(": All UI Tasks")
              when "my_ui_tasks"
                _(": My UI Tasks")
              when "rss"
                _(": RSS")
              when "storage_manager"
                _(": Storage - Storage Managers")
              when "ops"
                _(": Configuration")
              when "provider_foreman"
                _(": Configuration Management")
              when "pxe"
                _(": PXE")
              when "explorer"
                ": #{controller_model_name(params[:controller])} Explorer"
              when "vm_cloud"
                _(": Instances")
              when "vm_infra"
                _(": Virtual Machines")
              when "vm_or_template"
                _(": Workloads")

              # Specific titles for groups of layouts
              when /^miq_ae_/
                _(": Automation")
              when /^miq_policy/
                _(": Control")
              when /^miq_capacity/
                _(": Optimize")
              when /^miq_request/
                _(": Requests")
              when "manageiq/providers/ansible_tower/automation_manager/playbook"
                _(": Playbooks (Ansible Tower)")
              when "manageiq/providers/automation_manager/authentication"
                _(": Credentials")
              when "configuration_script_source"
                _(": Repositories")

              else
                # Assume layout is a table name and look up the plural version
                ": #{ui_lookup(:tables => layout)}"
              end
    end
  end
end
