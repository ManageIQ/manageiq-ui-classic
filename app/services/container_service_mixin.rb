module ContainerServiceMixin
  def graph_precision
    2
  end

  REALTIME_TIME_RANGE = 10 # 10 minutes

  def daily_pod_metrics
    daily_pod_create_trend = Hash.new(0)
    daily_pod_delete_trend = Hash.new(0)

    daily_metrics.each do |m|
      date = m.timestamp.beginning_of_day.utc
      fill_pod_metrics(m, date, daily_pod_create_trend, daily_pod_delete_trend)
    end

    if daily_pod_create_trend.size > 1
      {
        :interval_name => "daily",
        :xy_data       => create_delete_data(daily_pod_create_trend, daily_pod_delete_trend)
      }
    end
  end

  def pod_metrics
    daily_pod_metrics || hourly_pod_metrics
  end

  def fill_pod_metrics(m, time, pod_create_trend, pod_delete_trend)
    pod_create_trend[time] += m.stat_container_group_create_rate if m.stat_container_group_create_rate.present?
    pod_delete_trend[time] += m.stat_container_group_delete_rate if m.stat_container_group_delete_rate.present?
  end

  def hourly_pod_metrics
    hourly_pod_create_trend = Hash.new(0)
    hourly_pod_delete_trend = Hash.new(0)
    hourly_metrics.each do |m|
      hour = m.timestamp.beginning_of_hour.utc
      fill_pod_metrics(m, hour, hourly_pod_create_trend, hourly_pod_delete_trend)
    end

    {
      :interval_name => "hourly",
      :xy_data       => create_delete_data(hourly_pod_create_trend, hourly_pod_delete_trend)
    }
  end

  def create_delete_data(create_trend, delete_trend)
    if create_trend.any?
      {
        :xData    => create_trend.keys,
        :yCreated => create_trend.values.map(&:round),
        :yDeleted => delete_trend.values.map(&:round)
      }
    end
  end

  def fill_utilization(m, time, used_cpu, used_mem, total_cpu, total_mem)
    used_cpu[time] += m.v_derived_cpu_total_cores_used if m.v_derived_cpu_total_cores_used.present?
    used_mem[time] += m.derived_memory_used if m.derived_memory_used.present?
    total_cpu[time] += m.derived_vm_numvcpus if m.derived_vm_numvcpus.present?
    total_mem[time] += m.derived_memory_available if m.derived_memory_available.present?
  end

  def utilization_data(used_cpu, total_cpu, used_mem, total_mem)
    format_utilization_data(used_cpu, used_mem, total_cpu, total_mem)
  end

  def trend_data(trend)
    if trend.any?
      {
        :xData => trend.keys,
        :yData => trend.values.map { |value| (value || 0).round }
      }
    end
  end

  def realtime_network_metrics
    realtime_network_metrics = Hash.new(0)
    realtime_metrics.each do |m|
      minute = m.timestamp.beginning_of_minute.utc
      realtime_network_metrics[minute] += m.net_usage_rate_average if m.net_usage_rate_average.present?
    end

    if realtime_metrics.size > 1
      {
        :interval_name => "realtime",
        :xy_data       => trend_data(realtime_network_metrics)
      }
    end
  end

  def hourly_network_metrics
    hourly_network_metrics = Hash.new(0)
    hourly_metrics.each do |m|
      hour = m.timestamp.beginning_of_hour.utc
      hourly_network_metrics[hour] += m.net_usage_rate_average if m.net_usage_rate_average.present?
    end

    if hourly_network_metrics.size > 1
      {
        :interval_name => "hourly",
        :xy_data       => trend_data(hourly_network_metrics)
      }
    end
  end

  def empty_utilization_trend_data
    {
      :interval_name => "",
      :xy_data       => {:cpu => nil, :memory => nil}
    }
  end

  def empty_network_trend_data
    {
      :interval_name => "",
      :xy_data       => nil
    }
  end

  def daily_network_metrics
    daily_network_metrics = Hash.new(0)
    daily_metrics.each do |m|
      day = m.timestamp.beginning_of_day.utc
      daily_network_metrics[day] += m.net_usage_rate_average if m.net_usage_rate_average.present?
    end

    if daily_network_metrics.size > 1
      {
        :interval_name => "daily",
        :xy_data       => trend_data(daily_network_metrics)
      }
    end
  end

  def realtime_utilization
    used_cpu = Hash.new(0)
    used_mem = Hash.new(0)
    total_cpu = Hash.new(0)
    total_mem = Hash.new(0)

    realtime_metrics.each do |m|
      minute = m.timestamp.beginning_of_minute.utc
      fill_utilization(m, minute, used_cpu, used_mem, total_cpu, total_mem)
    end

    if used_cpu.any?
      {
        :interval_name => "realtime",
        :xy_data       => utilization_data(used_cpu, total_cpu, used_mem, total_mem)
      }
    end
  end

  def hourly_utilization
    used_cpu = Hash.new(0)
    used_mem = Hash.new(0)
    total_cpu = Hash.new(0)
    total_mem = Hash.new(0)

    hourly_metrics.each do |m|
      hour = m.timestamp.beginning_of_hour.utc
      fill_utilization(m, hour, used_cpu, used_mem, total_cpu, total_mem)
    end

    if used_cpu.any?
      {
        :interval_name => "hourly",
        :xy_data       => utilization_data(used_cpu, total_cpu, used_mem, total_mem)
      }
    end
  end

  def daily_utilization
    used_cpu = Hash.new(0)
    used_mem = Hash.new(0)
    total_cpu = Hash.new(0)
    total_mem = Hash.new(0)

    daily_metrics.each do |metric|
      date = metric.timestamp.beginning_of_day.utc
      fill_utilization(metric, date, used_cpu, used_mem, total_cpu, total_mem)
    end

    if used_cpu.any?
      {
        :interval_name => "daily",
        :xy_data       => utilization_data(used_cpu, total_cpu, used_mem, total_mem)
      }
    end
  end

  def hourly_metrics
    MetricRollup.with_interval_and_time_range("hourly", (1.day.ago.beginning_of_hour.utc)..(Time.now.utc))
                .where(:resource => @resource)
  end

  def daily_metrics
    current_user = @controller.current_user
    tp = TimeProfile.profile_for_user_tz(current_user.id, current_user.get_timezone) || TimeProfile.default_time_profile

    @daily_metrics ||= Metric::Helper.find_for_interval_name('daily', tp)
                                     .where(:resource => @resource)
                                     .where('timestamp > ?', 30.days.ago.utc).order('timestamp')
  end
end
