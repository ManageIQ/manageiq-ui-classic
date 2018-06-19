class EmsDashboardService < DashboardService
  include UiServiceMixin
  include Mixins::CheckedIdMixin

  def initialize(ems_id, controller, klass)
    @ems_id = ems_id
    @controller = controller
    @ems = find_record_with_rbac(klass, @ems_id) if @ems_id.present?
  end

  def recent_resources(model, title, label)
    all_resources = recent_records(model)
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

  def recent_records(model)
    all_records = Hash.new(0)
    records = model.where('created_on > ? and ems_id = ?', 30.days.ago.utc, @ems.id)
    records = records.includes(:resource => [:ext_management_system]) if @ems.blank?
    records.sort_by(&:created_on).uniq.each do |r|
      date = r.created_on.strftime("%Y-%m-%d")
      all_records[date] += model.where('created_on = ?', r.created_on).count
    end
    all_records
  end

  def format_data(attributes, attr_icon, attr_url, attr_hsh)
    attr_data = []
    attributes.each do |attr|
      attr_data.push(
        :id           => attr_hsh[attr] + '_' + @ems_id,
        :iconClass    => attr_icon[attr],
        :title        => attr_hsh[attr],
        :count        => @ems.send(attr).length,
        :href         => get_url('ems_cloud', @ems_id, attr_url[attr]),
        :notification => {
          :iconClass => 'pficon pficon-error-circle-o',
          :count     => 0,
        },
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

  def get_url(ems_type, ems_id, attr_url)
    "/#{ems_type}/#{ems_id}?display=#{attr_url}"
  end
end
