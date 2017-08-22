class ContainerProjectDashboardService
  include UiServiceMixin
  CPU_USAGE_PRECISION = 2 # 2 decimal points

  def initialize(project_id, controller)
    @project_id = project_id
    @project = ContainerProject.find(@project_id)
    @controller = controller
  end

  def all_data
    {
      :status              => status,
      :project_utilization => project_utilization,
      :network_metrics     => network_metrics,
      :pods                => pods,
      :quota               => quota,
      :pod_metrics         => pod_metrics
    }.compact
  end

  def status
    {
      :images     => {
        :count        => @project.container_images.count,
        :errorCount   => 0,
        :warningCount => 0,
        :href         => @controller.url_for(:controller => "container_project",
                                             :action     => "show",
                                             :id         => @project.id,
                                             :display    => "container_images")
      },
      :services   => {
        :count        => @project.container_services.count,
        :errorCount   => 0,
        :warningCount => 0,
        :href         => @controller.url_for(:controller => "container_project",
                                             :action     => "show",
                                             :id         => @project.id,
                                             :display    => "container_services")
      },
      :containers => {
        :count        => @project.containers.count,
        :errorCount   => 0,
        :warningCount => 0,
        :href         => @controller.url_for(:controller => "container",
                                             :action     => "show",
                                             :id         => @project.id,
                                             :display    => "containers")
      },
    }
  end

  def trend_data(trend)
    if trend.any?
      {
        :xData => trend.keys,
        :yData => trend.values.map(&:round)
      }
    end
  end

  def project_utilization
    daily_project_utilization || hourly_project_utilization
  end

  def daily_project_utilization
    used_cpu = Hash.new(0)
    used_mem = Hash.new(0)
    total_cpu = Hash.new(0)
    total_mem = Hash.new(0)

    daily_project_metrics.each do |metric|
      date = metric.timestamp.strftime("%Y-%m-%d")
      fill_project_utilization(metric, date, used_cpu, used_mem, total_cpu, total_mem)
    end

    if used_cpu.any?
      {
        :interval_name => "daily",
        :xy_data       => project_utilization_data(used_cpu, total_cpu, used_mem, total_mem)
      }
    end
  end

  def project_utilization_data(used_cpu, total_cpu, used_mem, total_mem)
    if used_cpu.any?
      {
        :cpu => {
          :used  => used_cpu.values.last.round,
          :total => total_cpu,
          :xData => used_cpu.keys,
          :yData => used_cpu.values.map(&:round)
        },
        :mem => {
          :used  => (used_mem.values.last / 1024.0).round,
          :total => total_mem,
          :xData => used_mem.keys,
          :yData => used_mem.values.map { |m| (m / 1024.0).round }
        }
      }
    end
  end

  def fill_project_utilization(m, time, used_cpu, used_mem, total_cpu, total_mem)
    used_cpu[time] += m.v_derived_cpu_total_cores_used if m.v_derived_cpu_total_cores_used.present?
    used_mem[time] += m.derived_memory_used if m.derived_memory_used.present?
    total_cpu[time] += m.derived_vm_numvcpus if m.derived_vm_numvcpus.present?
    total_mem[time] += m.derived_memory_available if m.derived_memory_available.present?
  end

  def hourly_project_utilization
    used_cpu = Hash.new(0)
    used_mem = Hash.new(0)
    total_cpu = Hash.new(0)
    total_mem = Hash.new(0)

    hourly_project_metrics.each do |m|
      hour = m.timestamp.beginning_of_hour.utc
      fill_project_utilization(m, hour, used_cpu, used_mem, total_cpu, total_mem)
    end

    {
      :interval_name => "hourly",
      :xy_data       => project_utilization_data(used_cpu, total_cpu, used_mem, total_mem) || {:cpu => nil, :mem => nil}
    }
  end

  def network_metrics
    daily_network_metrics || hourly_network_metrics
  end

  def hourly_network_metrics
    hourly_network_metrics = Hash.new(0)
    hourly_project_metrics.each do |m|
      hour = m.timestamp.beginning_of_hour.utc
      hourly_network_metrics[hour] += m.net_usage_rate_average if m.net_usage_rate_average.present?
    end

    {
      :interval_name => "hourly",
      :xy_data       => trend_data(hourly_network_metrics)
    }
  end

  def daily_network_metrics
    daily_network_metrics = Hash.new(0)
    daily_project_metrics.each do |m|
      day = m.timestamp.strftime("%Y-%m-%d")
      daily_network_metrics[day] += m.net_usage_rate_average if m.net_usage_rate_average.present?
    end

    {
      :interval_name => "daily",
      :xy_data       => trend_data(daily_network_metrics)
    }
  end

  def hourly_project_metrics
    MetricRollup.with_interval_and_time_range("hourly", (1.day.ago.beginning_of_hour.utc)..(Time.now.utc))
                .where(:resource => @project)
  end

  def daily_project_metrics
    current_user = @controller.current_user
    tp = TimeProfile.profile_for_user_tz(current_user.id, current_user.get_timezone) || TimeProfile.default_time_profile

    @daily_metrics ||= Metric::Helper.find_for_interval_name('daily', tp)
                                     .where(:resource => @project)
                                     .where('timestamp > ?', 30.days.ago.utc).order('timestamp')
  end

  def pods
    @project.container_groups.collect do |pod|
      {
        :name                       => pod.name,
        :phase                      => pod.phase,
        :running_containers_summary => pod.running_containers_summary,
        :ready_condition_status     => pod.ready_condition_status
      }
    end
  end

  def quota
    # Until https://github.com/ManageIQ/manageiq/pull/15639 is resolved
    parser = ManageIQ::Providers::Kubernetes::ContainerManager::RefreshParser.new

    @project.container_quota_items.collect do |quota_item|
      enforced = parser.parse_quantity(quota_item.quota_enforced)
      observed = parser.parse_quantity(quota_item.quota_observed)
      units = ""

      if quota_item.resource.include?("cpu")
        units = "Cores"
      elsif quota_item.resource.include?("memory")
        units = "MB"
        enforced /= 1.megabytes
        observed /= 1.megabytes
      end

      {
        :resource       => quota_item.resource,
        :quota_enforced => enforced,
        :quota_observed => observed,
        :units          => units
      }
    end
  end

  def pod_metrics
    daily_pod_metrics || hourly_pod_metrics
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

  def fill_pod_metrics(m, time, pod_create_trend, pod_delete_trend)
    pod_create_trend[time] += m.stat_container_group_create_rate if m.stat_container_group_create_rate.present?
    pod_delete_trend[time] += m.stat_container_group_delete_rate if m.stat_container_group_delete_rate.present?
  end

  def hourly_pod_metrics
    hourly_pod_create_trend = Hash.new(0)
    hourly_pod_delete_trend = Hash.new(0)
    hourly_project_metrics.each do |m|
      hour = m.timestamp.beginning_of_hour.utc
      fill_pod_metrics(m, hour, hourly_pod_create_trend, hourly_pod_delete_trend)
    end

    {
      :interval_name => "hourly",
      :xy_data       => create_delete_data(hourly_pod_create_trend, hourly_pod_delete_trend)
    }
  end

  def daily_pod_metrics
    daily_pod_create_trend = Hash.new(0)
    daily_pod_delete_trend = Hash.new(0)

    daily_project_metrics.each do |m|
      date = m.timestamp.strftime("%Y-%m-%d")
      fill_pod_metrics(m, date, daily_pod_create_trend, daily_pod_delete_trend)
    end

    if daily_pod_create_trend.size > 1
      {
        :interval_name => "daily",
        :xy_data       => create_delete_data(daily_pod_create_trend, daily_pod_delete_trend)
      }
    end
  end
end
