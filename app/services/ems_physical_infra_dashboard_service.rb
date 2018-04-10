class EmsPhysicalInfraDashboardService < DashboardService
  include UiServiceMixin

  def initialize(ems_id, controller)
    @ems_id = ems_id
    @ems = find_record_with_rbac(EmsPhysicalInfra, @ems_id)
    @controller = controller
  end

  def recent_servers_data
    {
      :recentServers => recent_servers
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
end
