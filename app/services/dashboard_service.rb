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
end
