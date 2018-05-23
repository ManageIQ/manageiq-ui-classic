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

  def attributes_data
    attributes = %i(physical_servers physical_racks)

    attr_icon = {
      :physical_servers => 'pficon pficon-cluster',
      :physical_racks   => 'pficon pficon-enterprise',
    }

    attr_url = {
      :physical_servers => 'physical_servers',
      :physical_racks   => 'physical_racks',
    }

    attr_hsh = {
      :physical_servers => _('Servers'),
      :physical_racks   => _('Racks'),
    }

    attr_data = []
    attributes.each do |attr|
      ems_attr = @ems.send(attr)
      attr_data.push(
        :id           => attr_hsh[attr] + '_' + @ems_id,
        :iconClass    => attr_icon[attr],
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
      icon_class = 'pficon pficon-warning-circle-o'
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

  def get_url(ems_id, attr_url)
    "/ems_physical_infra/#{ems_id}?display=#{attr_url}"
  end
end
