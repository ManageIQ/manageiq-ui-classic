class EmsDashboardService < DashboardService
  attr_reader :ems
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

  # Generates the following SQL:
  #
  #   SELECT COUNT(id), to_char(created_on, 'YYYY-MM-DD')
  #   FROM   model
  #   WHERE  ems_id = ?
  #     AND (created_on > 30.days.ago)
  #   GROUP BY to_char(created_on 'YYYY-MM-DD')
  #
  # Returns in the format:
  #
  #   {
  #     "2000-01-01" => 123,
  #     "2000-01-02" => 234,
  #     "2000-01-03" => 345,
  #     ...
  #   }
  def recent_records(model)
    db_table     = model.arel_table
    to_char_args = [db_table[:created_on], Arel::Nodes::SqlLiteral.new("'YYYY-MM-DD'")]
    group_by_sql = Arel::Nodes::NamedFunction.new("to_char", to_char_args)

    model.where(:ems_id => @ems.id)
         .where(db_table[:created_on].gt(30.days.ago.utc))
         .group(group_by_sql.to_sql)
         .count
  end

  def format_data(resource, attributes, attr_icon, attr_url, attr_hsh)
    attributes.reject { |a| @ems.send(a).nil? }.map do |attr|
      {
        :id        => "#{attr_hsh[attr]}_#{@ems_id}",
        :iconClass => attr_icon[attr],
        :title     => attr_hsh[attr],
        :count     => @ems.send(attr).count,
        :href      => get_url(resource, @ems_id, attr_url[attr]),
      }
    end
  end

  def status_data
    {
      :iconImage => get_icon(@ems),
      :largeIcon => true,
    }
  end

  def get_url(resource, ems_id, attr_url)
    "/#{resource}/#{ems_id}?display=#{attr_url}"
  end

  def self.quadicon_calc
    @quadicon_calc ||= proc { |ems| camelize_quadicon(quadicon_hash(ems)) }
  end
end
