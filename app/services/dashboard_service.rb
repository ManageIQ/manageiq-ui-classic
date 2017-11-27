module DashboardService
  def display_precision
    0
  end

  def graph_precision
    0
  end

  def format_utilization_data(used_cpu, used_mem, total_cpu, total_mem)
    {
      :cpu => used_cpu.any? ? format_cpu(used_cpu, total_cpu) : nil,
      :memory => used_mem.any? ? format_memory(used_mem, total_mem) : nil,
    }
  end

  def format_cpu(used, total)
    {
      :used  => cpu_round(used.values.last),
      :total => cpu_round(total.values.last),
      :xData => used.keys,
      :yData => used.values.map { |v| cpu_graph_round(v) },
    }
  end

  def cpu_round(val)
    (val || 0).round(display_precision)
  end

  def cpu_graph_round(val)
    (val || 0).round(graph_precision)
  end

  def format_memory(used, total)
    {
      :used  => mem_round(used.values.last),
      :total => mem_round(total.values.last),
      :xData => used.keys,
      :yData => used.values.map { |v| mem_graph_round(v) },
    }
  end

  def mem_round(val)
    ((val || 0) / 1024.0).round(display_precision)
  end

  def mem_graph_round(val)
    ((val || 0) / 1024.0).round(graph_precision)
  end
end
