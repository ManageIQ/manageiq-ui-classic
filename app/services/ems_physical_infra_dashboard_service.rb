class EmsPhysicalInfraDashboardService < DashboardService
  include Mixins::CheckedIdMixin

  def initialize(ems_id, controller)
    @ems_id = ems_id
    @resource = @ems_id.present? ? Array(find_record_with_rbac(EmsPhysicalInfra, @ems_id)) : EmsPhysicalInfra.all
    @controller = controller
  end

  def aggregate_status_data
    {
      :aggStatus => aggregate_status
    }.compact
  end

  def recent_servers_data
    {
      :recentServers => recent_servers
    }.compact
  end

  def aggregate_status
    if @ems_id.present?
      {
        :status          => single_provider,
        :attrData        => attributes_data,
        :showTopBorder   => false,
        :aggregateClass  => 'aggregate-object-card',
        :aggregateLayout => '',
      }
    else
      {
        :status          => multiple_providers,
        :attrData        => attributes_data,
        :showTopBorder   => true,
        :aggregateClass  => '',
        :aggregateLayout => 'tall',
      }
    end
  end

  def servers_group_data
    {
      :serversGroup => servers_group
    }.compact
  end

  def attributes_data
    attributes = %i[physical_chassis
                    physical_racks
                    physical_servers
                    physical_storages
                    physical_switches]

    attr_url = {
      :physical_chassis  => 'physical_chassis',
      :physical_racks    => 'physical_rack',
      :physical_servers  => 'physical_server',
      :physical_storages => 'physical_storage',
      :physical_switches => 'physical_switch',
    }

    attr_hsh = {
      :physical_chassis  => _('Chassis'),
      :physical_racks    => _('Racks'),
      :physical_servers  => _('Servers'),
      :physical_storages => _('Storages'),
      :physical_switches => _('Switches'),
    }

    attr_data = []
    attributes.each do |attr|
      attr_notification = []
      current_data = {
        :id           => attr_hsh[attr] + 'Id',
        :iconClass    => attr.to_s.classify.safe_constantize.try(:decorate).try(:fonticon),
        :title        => attr_hsh[attr],
        :count        => 0,
        :href         => get_url_to_entity(@controller, attr_url[attr], @ems_id, @resource.first),
        :notification => {}
      }
      @resource.each do |ems|
        ems_attr = ems.send(attr)
        current_data[:count] += ems_attr.length
        attr_notification.concat(ems_attr)
      end
      current_data[:notification] = notification_data(attr_notification, attr_hsh[attr])
      attr_data.push(current_data)
    end
    attr_data
  end

  def single_provider
    {
      :iconImage => get_icon(@resource.first),
      :largeIcon => true,
    }
  end

  def multiple_providers
    providers_data = {
      :title         => _('Providers'),
      :count         => 0,
      :href          => get_url_to_entity(@controller, :ems_physical_infra),
      :notifications => {}
    }
    notification = []

    physical_infra_providers = ManageIQ::Providers::PhysicalInfraManager
    providers_count = physical_infra_providers.group(:type).count

    providers_count.each do |provider, count|
      providers_data[:count] += count
      notification.push(build_provider_notification(provider, count))
    end
    providers_data[:notifications] = notification

    providers_data
  end

  def build_provider_notification(provider_namespace, count)
    type = provider_namespace.split('::')[2].to_sym
    provider = provider_namespace.constantize.new
    {
      :count     => count,
      :typeName  => _(type),
      :iconImage => get_icon(provider),
    }
  end

  def recent_servers
    # Get recent servers
    all_servers = recent_records(PhysicalServer)
    config = {
      :title => _('Recent Servers'),
      :label => _('Servers')
    }
    return { :dataAvailable => false, :config => config} if all_servers.blank?
    {
      :dataAvailable => true,
      :xData         => all_servers.keys,
      :yData         => all_servers.values.map,
      :config        => config
    }
  end

  def notification_data(components, component_type)
    if components&.first.respond_to?(:health_state)
      count = 0
      health_states = components.each_with_object({}) do |component, health_state|
        health_state[component.health_state&.downcase] = (health_state[component.health_state&.downcase] || 0) + 1
      end
      health_states.default = 0
      critical_count = health_states["critical"]
      warning_count = health_states["warning"]

      if critical_count.positive?
        icon_class = 'pficon pficon-error-circle-o'
        count = critical_count
        health_state = 'critical'
      elsif warning_count.positive?
        icon_class = 'pficon pficon-warning-triangle-o'
        count = warning_count
        health_state = 'warning'
      else
        health_state = 'valid'
        icon_class = 'pficon pficon-ok'
      end
      tooltip_count = count.positive? ? count : components.length
      {
        :count     => count,
        :iconClass => icon_class,
        :tooltip   => format_tooltip(health_state, component_type.downcase, tooltip_count),
      }
    end
  end

  def format_tooltip(health_state, component_type, count)
    tooltip_data = {
      :count          => count,
      :component_type => count > 1 ? component_type : component_type.singularize,
      :health_state   => health_state,
    }
    n_(
      "%{count} %{component_type} is in %{health_state} state.",
      "%{count} %{component_type} are in %{health_state} state.",
      count
    ) % tooltip_data
  end

  def servers_group
    # Get recent Servers
    all_servers = Hash.new(0)
    servers_with_host = Hash.new(0)
    valid_servers = Hash.new(0)
    warning_servers = Hash.new(0)
    critical_servers = Hash.new(0)
    all_physical_servers = PhysicalServer.where('created_at > ?', 30.days.ago.utc)
    all_physical_servers = all_physical_servers.where('ems_id = ?', @ems_id) if @ems_id
    all_physical_servers.sort_by(&:created_at).each do |server|
      date = server.created_at.strftime("%Y-%m-%d")
      all_servers[date] += 1
      servers_with_host[date] += 1 if server.host.present?
      valid_servers[date] += 1 if server.health_state == 'Valid'
      warning_servers[date] += 1 if server.health_state == 'Warning'
      critical_servers[date] += 1 if server.health_state == 'Critical'
    end

    format_server_utilization_data(all_servers, valid_servers, warning_servers, critical_servers, servers_with_host)
  end

  private

  def format_server_utilization_data(total_servers, valid_servers, warning_servers, critical_servers, servers_with_host)
    {
      :availableServers => total_servers.any? ? format_value(total_servers, servers_with_host) : nil,
      :serversHealth    => total_servers.any? ? format_servers_health(total_servers, valid_servers, warning_servers, critical_servers) : nil,
    }
  end

  def format_value(total, target)
    available = check_num(total.values.last) - check_num(target.values.last)
    {
      :columns => {
        :used      => check_num(target.values.last),
        :available => check_num(available),
      },
      :xData   => total.keys,
      :yData   => total.values.map,
    }
  end

  def format_servers_health(total_servers, valid_servers, warning_servers, critical_servers)
    {
      :columns => {
        :valid    => check_num(valid_servers.values.last),
        :warning  => check_num(warning_servers.values.last),
        :critical => check_num(critical_servers.values.last),
      },
      :xData   => total_servers.keys,
      :yData   => total_servers.values.map,
    }
  end

  def check_num(val)
    (val || 0)
  end

  def recent_records(model)
    all_records = Hash.new(0)
    records = model.where('created_at > ?', 30.days.ago.utc)
    records = if @ems_id
                records.where('ems_id = ?', @ems_id)
              else
                records.includes(:resource => [:ext_management_system])
              end
    records.sort_by(&:created_at).uniq.each do |r|
      date = r.created_at.strftime("%Y-%m-%d")
      all_records[date] += model.where('created_at = ?', r.created_at).count
    end
    all_records
  end
end
