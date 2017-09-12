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
              when "rss"
                _(": RSS")
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
              when /^miq_capacity_utilization/
                _(": Utilization")
              when /^miq_capacity_planning/
                _(": Planning")
              when /^miq_capacity_bottlenecks/
                _(": Bottlenecks")
              when /^miq_request/
                _(": Requests")
              when "manageiq/providers/ansible_tower/automation_manager/playbook"
                _(": Playbooks (Ansible Tower)")
              when "manageiq/providers/embedded_ansible/automation_manager/playbook"
                _(": Playbooks")
              when "manageiq/providers/embedded_automation_manager/authentication"
                _(": Credentials")
              when "manageiq/providers/embedded_automation_manager/configuration_script_source"
                _(": Repositories")

              else
                # Assume layout is a table name and look up the plural version
                ": #{ui_lookup(:tables => layout)}"
              end
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
  end
end
