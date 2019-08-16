class DashboardService
  def display_precision
    0
  end

  def graph_precision
    0
  end

  def format_utilization_data(used_cpu, used_mem, total_cpu, total_mem)
    {
      :cpu    => used_cpu.any? ? format_cpu(used_cpu, total_cpu) : nil,
      :memory => used_mem.any? ? format_memory(used_mem, total_mem) : nil,
    }
  end

  def format_cpu(used, total)
    {
      :used  => cpu_num(used.values.last).round(display_precision),
      :total => cpu_num(total.values.last).round(0),
      :xData => used.keys,
      :yData => used.values.map { |v| cpu_num(v).round(graph_precision) },
    }
  end

  def cpu_num(val)
    (val || 0)
  end

  def format_memory(used, total)
    {
      :used  => mem_num(used.values.last).round(display_precision),
      :total => mem_num(total.values.last).round(0),
      :xData => used.keys,
      :yData => used.values.map { |v| mem_num(v).round(graph_precision) },
    }
  end

  def mem_num(val)
    ((val || 0) / 1024.0)
  end

  def get_icon(ems)
    ActionController::Base.helpers.image_path(ems.decorate.fileicon)
  end

  def get_url_to_entity(controller, entity, ems_id = nil, ems = nil)
    if controller.present?
      if ems_id.present?
        controller.polymorphic_url(ems, :display => entity.to_s.pluralize)
      else
        controller.url_for_only_path(:action     => 'show_list',
                                     :controller => entity.to_sym)
      end
    end
  end

  def format_data(resource, attributes, attr_icon, attr_url, attr_hsh)
    attr_data = []
    attributes.each do |attr|
      attr_data.push(
        :id        => "#{attr_hsh[attr]}_#{@record_id}",
        :iconClass => attr_icon[attr],
        :title     => attr_hsh[attr],
        :count     => @record.send(attr).count,
        :href      => get_url(resource, @record_id, attr_url[attr])
      )
    end
    attr_data
  end

  def status_data
    {
      :iconImage => get_icon(@record),
      :largeIcon => true,
    }
  end
end
