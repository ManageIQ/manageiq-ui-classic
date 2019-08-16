class CloudTenantDashboardService < DashboardService
  include Mixins::CheckedIdMixin

  def initialize(tenant, controller, klass)
    @record_id = tenant.id
    @record = tenant
  end

  def attributes_data
    attributes = %i[cloud_object_store_containers miq_templates vms security_groups cloud_networks cloud_subnets network_ports cloud_volumes]

    attr_icon = {
      :cloud_object_store_containers => 'ff ff-cloud-object-store',
      :miq_templates                 => 'fa fa-database',
      :vms                           => 'pficon pficon-virtual-machine',
      :security_groups               => 'pficon pficon-cloud-security',
      :cloud_networks                => 'ff ff-cloud-network',
      :cloud_subnets                 => 'pficon pficon-network',
      :network_ports                 => 'ff ff-network-port',
      :cloud_volumes                 => 'pficon pficon-volume'
    }

    attr_url = {
      :cloud_object_store_containers => 'cloud_object_store_containers',
      :miq_templates                 => 'images',
      :vms                           => 'instances',
      :security_groups               => 'security_groups',
      :cloud_networks                => 'cloud_networks',
      :cloud_subnets                 => 'cloud_subnets',
      :network_ports                 => 'network_ports',
      :cloud_volumes                 => 'cloud_volumes'
    }

    attr_hsh = {
      :cloud_object_store_containers => _("Cloud Object Store Containers"),
      :miq_templates                 => _("Images"),
      :vms                           => _("Instances"),
      :security_groups               => _("Security Groups"),
      :cloud_networks                => _("Cloud Networks"),
      :cloud_subnets                 => _("Cloud Subnets"),
      :network_ports                 => _("Network Ports"),
      :cloud_volumes                 => _("Cloud Volumes")
    }

    format_data('cloud_tenant', attributes, attr_icon, attr_url, attr_hsh)
  end

  def get_url(resource, _record_id, attr_url)
    "/#{resource}/show/#{@record_id}?display=#{attr_url}"
  end

  def get_icon(tenant)
    fileicon = tenant.ext_management_system.decorate.try(:fileicon)
    fileicon ? ActionController::Base.helpers.image_path(fileicon) : nil
  end

  def recent_images_data
    recent_resources(MiqTemplate, _('Recent Images'), _('Images'), @record.miq_templates)
  end

  def recent_instances_data
    recent_resources(ManageIQ::Providers::CloudManager::Vm, _('Recent Instances'), _('Instances'), @record.vms)
  end

  def aggregate_status_data
    {
      :aggStatus => aggregate_status
    }.compact
  end

  def aggregate_status
    {
      :status   => status_data,
      :attrData => attributes_data,
    }
  end

  def recent_resources(model, title, label, relation)
    all_resources = recent_records(model, relation)
    config = {
      :title => title,
      :label => label
    }

    data = if all_resources.blank?
             {
               :dataAvailable => false,
               :config        => config
             }
           else
             {
               :dataAvailable => true,
               :xData         => all_resources.keys,
               :yData         => all_resources.values.map,
               :config        => config
             }
           end
    {
      :recentResources => data
    }.compact
  end

  def recent_records(model, relation)
    db_table     = model.arel_table
    to_char_args = [db_table[:created_on], Arel::Nodes::SqlLiteral.new("'YYYY-MM-DD'")]
    group_by_sql = Arel::Nodes::NamedFunction.new("to_char", to_char_args)

    relation.where(db_table[:created_on].gt(30.days.ago.utc))
            .group(group_by_sql.to_sql)
            .count
  end
end
