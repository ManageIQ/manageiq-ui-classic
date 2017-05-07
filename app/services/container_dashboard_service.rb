class ContainerDashboardService
  include UiServiceMixin
  CPU_USAGE_PRECISION = 2 # 2 decimal points
  REALTIME_TIME_RANGE = 10 # 10 minutes

  def initialize(provider_id, controller)
    @provider_id = provider_id
    @ems = ManageIQ::Providers::ContainerManager.find(@provider_id) unless @provider_id.blank?
    @controller = controller
  end

  def all_data
    {
      :providers_link  => get_url_to_entity(:ems_container),
      :status          => status,
      :providers       => providers,
      :alerts          => alerts,
      :heatmaps        => heatmaps,
      :ems_utilization => ems_utilization,
      :network_metrics => network_metrics,
      :pod_metrics     => pod_metrics,
      :image_metrics   => image_metrics
    }.compact
  end

  def status
    if @ems.present?
      routes_count = @ems.respond_to?(:container_routes) ? @ems.container_routes.count : 0 # ems might not have routes
    else
      routes_count = ContainerRoute.count
    end

    {
      :nodes      => {
        :count        => @ems.present? ? @ems.container_nodes.count : ContainerNode.count,
        :errorCount   => 0,
        :warningCount => 0,
        :href         => get_url_to_entity(:container_node)
      },
      :containers => {
        :count        => @ems.present? ? @ems.containers.count : Container.active.count,
        :errorCount   => 0,
        :warningCount => 0,
        :href         => get_url_to_entity(:container)
      },
      :registries => {
        :count        => @ems.present? ? @ems.container_image_registries.count : ContainerImageRegistry.count,
        :errorCount   => 0,
        :warningCount => 0,
        :href         => get_url_to_entity(:container_image_registry)
      },
      :projects   => {
        :count        => @ems.present? ? @ems.container_projects.count : ContainerProject.active.count,
        :errorCount   => 0,
        :warningCount => 0,
        :href         => get_url_to_entity(:container_project)
      },
      :pods       => {
        :count        => @ems.present? ? @ems.container_groups.count : ContainerGroup.active.count,
        :errorCount   => 0,
        :warningCount => 0,
        :href         => get_url_to_entity(:container_group)
      },
      :services   => {
        :count        => @ems.present? ? @ems.container_services.count : ContainerService.count,
        :errorCount   => 0,
        :warningCount => 0,
        :href         => get_url_to_entity(:container_service)
      },
      :images     => {
        :count        => @ems.present? ? @ems.container_images.count : ContainerImage.active.count,
        :errorCount   => 0,
        :warningCount => 0,
        :href         => get_url_to_entity(:container_image)
      },
      :routes     => {
        :count        => routes_count,
        :errorCount   => 0,
        :warningCount => 0,
        :href         => get_url_to_entity(:container_route)
      }
    }
  end

  def providers
    provider_classes_to_ui_types = ManageIQ::Providers::ContainerManager.subclasses.each_with_object({}) { |subclass, h|
      name = subclass.name.split('::')[2]
      h[subclass.name] = name.to_sym
    }
    providers = @ems.present? ? {@ems.type => 1} : ManageIQ::Providers::ContainerManager.group(:type).count

    result = {}
    providers.each do |provider, count|
      ui_type = provider_classes_to_ui_types[provider]
      (result[ui_type] ||= build_provider_status(ui_type))[:count] += count
    end
    result.values
  end

  def alerts
    errors = 0
    warnings = 0

    relation = @ems ? @ems.miq_alert_statuses : MiqAlertStatus.where.not(:ems_id => nil)
    warnings, errors = relation.group(:severity).count.values_at(*%w(warning error)) if relation.present?

    errors_struct = errors > 0 ? {:iconClass => "pficon pficon-error-circle-o", :count => errors} : nil
    warnings_struct = warnings > 0 ? {:iconClass => "pficon pficon-warning-triangle-o", :count => warnings} : nil
    notifications = if (errors + warnings) > 0
                      [errors_struct, warnings_struct].compact
                    else
                      [{:iconClass => "pficon-large pficon-ok"}]
                    end

    {
      :count         => (errors + warnings) > 0 ? (errors + warnings) : nil,
      :href          => @controller.url_for_only_path(:action => 'show', :controller => :alerts_overview),
      :notifications => notifications
    }
  end

  def build_provider_status(provider_type)
    provider_status_icon = if @ems.present?
                             if @ems.enabled?
                               icons[:StatusOn][:icon]
                             else
                               icons[:StatusPaused][:icon]
                             end
                           end

    {
      :count      => 0,
      :typeName   => _(provider_type.to_s),
      :iconImage  => icons[provider_type][:icon],
      :statusIcon => provider_status_icon
    }
  end

  def get_url_to_entity(entity)
    if @ems.present?
      @controller.polymorphic_url(@ems, :display => entity.to_s.pluralize)
    else
      @controller.url_for_only_path(:action     => 'show_list',
                          :controller => entity)
    end
  end

  def realtime_heatmaps
    node_ids = @ems.container_nodes if @ems.present?
    metrics = Metric::Helper.latest_metrics(ContainerNode.name, REALTIME_TIME_RANGE.minutes.ago.utc, node_ids)
    metrics = metrics.includes(:resource)
    metrics = metrics.includes(:resource => [:ext_management_system]) unless @ems.present?
    heatmaps_data(metrics)
  end

  def hourly_heatmaps
    # Get latest hourly rollup for each node.
    node_ids = @ems.container_nodes if @ems.present?
    metrics = MetricRollup.latest_rollups(ContainerNode.name, node_ids)
    metrics = metrics.where('timestamp > ?', 1.day.ago.utc).includes(:resource)
    metrics = metrics.includes(:resource => [:ext_management_system]) unless @ems.present?

    data = heatmaps_data(metrics)
    data if data[:nodeCpuUsage]
  end

  def heatmaps_data(metrics)
    node_cpu_usage = []
    node_memory_usage = []

    metrics.each do |m|
      next if m.resource.nil? # Metrics are purged asynchronously and might be missing their node
      provider_name = @ems.present? ? @ems.name : m.resource.ext_management_system.name

      node_cpu_usage << {
        :id       => m.resource.id,
        :node     => m.resource.name,
        :provider => provider_name,
        :total    => m.derived_vm_numvcpus.present? ? m.derived_vm_numvcpus.round : nil,
        :percent  => m.cpu_usage_rate_average.present? ? (m.cpu_usage_rate_average / 100.0).round(CPU_USAGE_PRECISION) : nil # pf accepts fractions 90% = 0.90
      }

      node_memory_usage << {
        :id       => m.resource.id,
        :node     => m.resource.name,
        :provider => m.resource.ext_management_system.name,
        :total    => m.derived_memory_available.present? ? m.derived_memory_available.round : nil,
        :percent  => m.mem_usage_absolute_average.present? ? (m.mem_usage_absolute_average / 100.0).round(CPU_USAGE_PRECISION) : nil # pf accepts fractions 90% = 0.90
      }
    end

    {
      :nodeCpuUsage    => node_cpu_usage.presence,
      :nodeMemoryUsage => node_memory_usage.presence
    }
  end

  def heatmaps
    hourly_heatmaps || realtime_heatmaps
  end

  def fill_ems_utilization(m, time, used_cpu, used_mem, total_cpu, total_mem)
    used_cpu[time] += m.v_derived_cpu_total_cores_used if m.v_derived_cpu_total_cores_used.present?
    used_mem[time] += m.derived_memory_used if m.derived_memory_used.present?
    total_cpu[time] += m.derived_vm_numvcpus if m.derived_vm_numvcpus.present?
    total_mem[time] += m.derived_memory_available if m.derived_memory_available.present?
  end

  def realtime_ems_utilization
    used_cpu = Hash.new(0)
    used_mem = Hash.new(0)
    total_cpu = Hash.new(0)
    total_mem = Hash.new(0)

    realtime_provider_metrics.each do |m|
      minute = m.timestamp.beginning_of_minute.utc
      fill_ems_utilization(m, minute, used_cpu, used_mem, total_cpu, total_mem)
    end

    {
      :interval_name => "realtime",
      :xy_data       => ems_utilization_data(used_cpu, total_cpu, used_mem, total_mem) || {:cpu => nil, :mem => nil}
    }
  end

  def hourly_ems_utilization
    used_cpu = Hash.new(0)
    used_mem = Hash.new(0)
    total_cpu = Hash.new(0)
    total_mem = Hash.new(0)

    hourly_provider_metrics.each do |m|
      hour = m.timestamp.beginning_of_hour.utc
      fill_ems_utilization(m, hour, used_cpu, used_mem, total_cpu, total_mem)
    end

    if used_cpu.any?
      {
        :interval_name => "hourly",
        :xy_data       => ems_utilization_data(used_cpu, total_cpu, used_mem, total_mem)
      }
    end
  end

  def daily_ems_utilization
    used_cpu = Hash.new(0)
    used_mem = Hash.new(0)
    total_cpu = Hash.new(0)
    total_mem = Hash.new(0)

    daily_provider_metrics.each do |metric|
      date = metric.timestamp.strftime("%Y-%m-%d")
      fill_ems_utilization(metric, date, used_cpu, used_mem, total_cpu, total_mem)
    end

    if used_cpu.any?
      {
        :interval_name => "daily",
        :xy_data       => ems_utilization_data(used_cpu, total_cpu, used_mem, total_mem)
      }
    end
  end

  def ems_utilization_data(used_cpu, total_cpu, used_mem, total_mem)
    if used_cpu.any?
      {
        :cpu => {
          :used  => used_cpu.values.last.round,
          :total => total_cpu.values.last.round,
          :xData => used_cpu.keys,
          :yData => used_cpu.values.map(&:round)
        },
        :mem => {
          :used  => (used_mem.values.last / 1024.0).round,
          :total => (total_mem.values.last / 1024.0).round,
          :xData => used_mem.keys,
          :yData => used_mem.values.map { |m| (m / 1024.0).round }
        }
      }
    end
  end

  def ems_utilization
    daily_ems_utilization || hourly_ems_utilization || realtime_ems_utilization
  end

  def realtime_network_metrics
    realtime_network_metrics = Hash.new(0)
    realtime_provider_metrics.each do |m|
      minute = m.timestamp.beginning_of_minute.utc
      realtime_network_metrics[minute] += m.net_usage_rate_average if m.net_usage_rate_average.present?
    end

    {
      :interval_name => "realtime",
      :xy_data       => trend_data(realtime_network_metrics)
    }
  end

  def hourly_network_metrics
    hourly_network_metrics = Hash.new(0)
    hourly_provider_metrics.each do |m|
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

  def daily_network_metrics
    daily_network_metrics = Hash.new(0)
    daily_provider_metrics.each do |m|
      day = m.timestamp.strftime("%Y-%m-%d")
      daily_network_metrics[day] += m.net_usage_rate_average if m.net_usage_rate_average.present?
    end

    if daily_network_metrics.size > 1
      {
        :interval_name => "daily",
        :xy_data       => trend_data(daily_network_metrics)
      }
    end
  end

  def network_metrics
    daily_network_metrics || hourly_network_metrics || realtime_network_metrics
  end

  def fill_pod_metrics(m, time, pod_create_trend, pod_delete_trend)
    pod_create_trend[time] += m.stat_container_group_create_rate if m.stat_container_group_create_rate.present?
    pod_delete_trend[time] += m.stat_container_group_delete_rate if m.stat_container_group_delete_rate.present?
  end

  def hourly_pod_metrics
    hourly_pod_create_trend = Hash.new(0)
    hourly_pod_delete_trend = Hash.new(0)
    hourly_provider_metrics.each do |m|
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

    daily_provider_metrics.each do |m|
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

  def hourly_image_metrics
    hourly_image_metrics = Hash.new(0)
    hourly_provider_metrics.each do |m|
      hour = m.timestamp.beginning_of_hour.utc
      if m.stat_container_image_registration_rate.present?
        hourly_image_metrics[hour] += m.stat_container_image_registration_rate
      end
    end

    {
      :interval_name => "hourly",
      :xy_data       => trend_data(hourly_image_metrics)
    }
  end

  def daily_image_metrics
    daily_image_metrics = Hash.new(0)
    daily_provider_metrics.each do |m|
      day = m.timestamp.strftime("%Y-%m-%d")
      daily_image_metrics[day] +=
        m.stat_container_image_registration_rate if m.stat_container_image_registration_rate.present?
    end

    if daily_image_metrics.size > 1
      {
        :interval_name => "daily",
        :xy_data       => trend_data(daily_image_metrics)
      }
    end
  end

  def image_metrics
    daily_image_metrics || hourly_image_metrics
  end

  def trend_data(trend)
    if trend.any?
      {
        :xData => trend.keys,
        :yData => trend.values.map(&:round)
      }
    end
  end

  def realtime_provider_metrics
    current_user = @controller.current_user
    tp = TimeProfile.profile_for_user_tz(current_user.id, current_user.get_timezone) || TimeProfile.default_time_profile
    Metric::Helper.find_for_interval_name('realtime', tp)
                  .where(:resource => (@ems.try(:container_nodes) || ContainerNode.all))
                  .where('timestamp > ?', REALTIME_TIME_RANGE.minutes.ago.utc).order('timestamp')
  end

  def hourly_provider_metrics
    MetricRollup.with_interval_and_time_range("hourly", (1.day.ago.beginning_of_hour.utc)..(Time.now.utc))
                .where(:resource => (@ems || ManageIQ::Providers::ContainerManager.all))
  end

  def daily_provider_metrics
    current_user = @controller.current_user
    tp = TimeProfile.profile_for_user_tz(current_user.id, current_user.get_timezone) || TimeProfile.default_time_profile

    @daily_metrics ||= Metric::Helper.find_for_interval_name('daily', tp)
                                     .where(:resource => (@ems || ManageIQ::Providers::ContainerManager.all))
                                     .where('timestamp > ?', 30.days.ago.utc).order('timestamp')
  end
end
