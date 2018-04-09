class EmsPhysicalInfraDashboardService < DashboardService
  include UiServiceMixin

  def initialize(ems_id, controller)
    @ems_id = ems_id
    @ems = EmsPhysicalInfra.find(@ems_id) if @ems_id.present?
    @controller = controller
  end

  def recent_servers_data
    {
      :recentHosts => recent_servers
    }.compact
  end

  def recent_servers
    # Get recent hosts
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
    records = model.where('created_on > ? and ems_id = ?', 30.days.ago.utc, @ems.id)
    records = records.includes(:resource => [:ext_management_system]) if @ems.blank?
    records.sort_by { |r| r.created_on }.uniq.each do |r|
      date = r.created_on.strftime("%Y-%m-%d")
      all_records[date] += model.where('created_on = ?', r.created_on).count
    end
    all_records
  end
end
