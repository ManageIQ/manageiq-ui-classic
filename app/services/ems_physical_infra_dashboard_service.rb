class EmsPhysicalInfraDashboardService < DashboardService
  include UiServiceMixin
  include Mixins::CheckedIdMixin

  def initialize(ems_id, controller)
    @ems_id = ems_id
    @ems = find_record_with_rbac(EmsPhysicalInfra, @ems_id)
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
    {
      :status   => status_data,
      :attrData => attributes_data
    }
  end

  def servers_group_data
    {
      :serversGroup => servers_group
    }.compact
  end

  def attributes_data
    attributes = %i(physical_chassis
                    physical_servers
                    physical_switches
                    physical_racks
                    physical_storages)

    attr_url = {
      :physical_chassis  => 'physical_chassis',
      :physical_servers  => 'physical_servers',
      :physical_switches => 'physical_switches',
      :physical_racks    => 'physical_racks',
      :physical_storages => 'physical_storages',
    }

    attr_hsh = {
      :physical_chassis  => _('Chassis'),
      :physical_servers  => _('Servers'),
      :physical_switches => _('Switches'),
      :physical_racks    => _('Racks'),
      :physical_storages => _('Storages'),
    }

    attr_data = []
    attributes.each do |attr|
      ems_attr = @ems.send(attr)
      attr_data.push(
        :id           => attr_hsh[attr] + '_' + @ems_id,
        :iconClass    => attr.to_s.camelize.safe_constantize.try(:decorate).try(:fonticon),
        :title        => attr_hsh[attr],
        :count        => ems_attr.length,
        :href         => get_url(@ems_id, attr_url[attr]),
        :notification => notification_data(ems_attr)
      )
    end
    attr_data
  end

  def status_data
    {
      :iconImage => get_icon(@ems),
      :largeIcon => true,
    }
  end

  def servers_health_data
    {
      :serversHealth => servers_health
    }.compact
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

  def notification_data(attrs)
    valid = 0
    warning = 0
    critical = 0
    attrs.each do |attr|
      next unless attr.respond_to?(:health_state)
      case attr.health_state&.downcase
      when 'critical'
        critical += 1
      when 'warning'
        warning += 1
      when 'valid'
        valid += 1
      end
    end
    if critical.positive?
      icon_class = 'pficon pficon-error-circle-o'
      count = critical
    elsif warning.positive?
      icon_class = 'pficon pficon-warning-triangle-o'
      count = warning
    elsif valid.positive?
      icon_class = 'pficon pficon-ok'
      count = valid
    else
      icon_class = 'pficon pficon-error-circle-o'
      count = 0
    end

    {
      :iconClass => icon_class,
      :count     => count,
    }
  end

  def servers_group
    # Get recent Servers
    all_servers = Hash.new(0)
    servers_with_host = Hash.new(0)
    valid_servers = Hash.new(0)
    warning_servers = Hash.new(0)
    critical_servers = Hash.new(0)
    all_physical_servers = PhysicalServer.where('created_at > ? and ems_id = ?', 30.days.ago.utc, @ems.id)
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
    records = model.where('created_at > ? and ems_id = ?', 30.days.ago.utc, @ems.id)
    records = records.includes(:resource => [:ext_management_system]) if @ems.blank?
    records.sort_by(&:created_at).uniq.each do |r|
      date = r.created_at.strftime("%Y-%m-%d")
      all_records[date] += model.where('created_at = ?', r.created_at).count
    end
    all_records
  end

  def daily_provider_metrics
    current_user = @controller.current_user
    tp = TimeProfile.profile_for_user_tz(current_user.id, current_user.get_timezone) || TimeProfile.default_time_profile

    @daily_metrics ||= Metric::Helper.find_for_interval_name('daily', tp)
                                     .where(:resource => (@ems || ManageIQ::Providers::PhysicalInfraManager.all))
                                     .where('timestamp > ?', 30.days.ago.utc).order('timestamp')
  end

  def get_url(ems_id, attr_url)
    "/ems_physical_infra/#{ems_id}?display=#{attr_url}"
  end
end
