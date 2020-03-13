class EmsInfraDashboardService < EmsDashboardService
  CPU_USAGE_PRECISION = 2 # 2 decimal points

  def cluster_heatmap_data
    {
      :heatmaps => heatmaps
    }.compact
  end

  def recent_hosts_data
    recent_resources(Host, _('Recent Hosts'), _('Hosts'))
  end

  def recent_vms_data
    recent_resources(VmOrTemplate, _('Recent VMs'), _('VMs'))
  end

  def ems_utilization_data
    {
      :ems_utilization => ems_utilization
    }.compact
  end

  def aggregate_status_data
    {
      :aggStatus => aggregate_status
    }.compact
  end

  def aggregate_status
    {
      :quadicon => @controller.instance_exec(@ems, &EmsInfraDashboardService.quadicon_calc),
      :status   => status_data,
      :attrData => attributes_data,
    }
  end

  def attributes_data
    attributes = %i[ems_clusters hosts storages vms miq_templates]

    attr_icon = {
      :ems_clusters  => 'pficon pficon-cluster',
      :hosts         => 'pficon pficon-container-node',
      :storages      => 'fa fa-database',
      :vms           => 'pficon pficon-virtual-machine',
      :miq_templates => 'pficon pficon-virtual-machine',
    }

    attr_url = {
      :ems_clusters  => 'ems_clusters',
      :hosts         => 'hosts',
      :storages      => 'storages',
      :vms           => 'vms',
      :miq_templates => 'miq_templates',
    }

    attr_hsh = {
      :ems_clusters  => _('Clusters'),
      :hosts         => _('Hosts'),
      :storages      => _('Datastores'),
      :vms           => _('VMs'),
      :miq_templates => _('Templates'),
    }

    format_data('ems_infra', attributes, attr_icon, attr_url, attr_hsh)
  end

  def heatmaps
    # Get latest hourly rollup for each node.
    cluster_ids = @ems.ems_clusters if @ems.present?
    metrics = MetricRollup.latest_rollups(EmsCluster.name, cluster_ids)
    metrics = metrics.where('timestamp > ?', 30.days.ago.utc).includes(:resource)
    metrics = metrics.includes(:resource => [:ext_management_system]) if @ems.blank?

    cluster_cpu_usage = []
    cluster_memory_usage = []

    metrics.each do |m|
      next if m.resource.nil? # Metrics are purged asynchronously and might be missing their node
      provider_name = @ems.present? ? @ems.name : m.resource.ext_management_system.name

      cluster_cpu_usage << {
        :id       => m.resource.id,
        :node     => m.resource.name,
        :provider => provider_name,
        :unit     => "Cores",
        :total    => m.derived_vm_numvcpus.present? ? m.derived_vm_numvcpus.round : nil,
        :percent  => m.cpu_usage_rate_average.present? ? (m.cpu_usage_rate_average / 100.0).round(CPU_USAGE_PRECISION) : nil # pf accepts fractions 90% = 0.90
      }

      cluster_memory_usage << {
        :id       => m.resource.id,
        :node     => m.resource.name,
        :provider => m.resource.ext_management_system.name,
        :unit     => "GB",
        :total    => m.derived_memory_available.present? ? (m.derived_memory_available / 1024).round : nil,
        :percent  => m.mem_usage_absolute_average.present? ? (m.mem_usage_absolute_average / 100.0).round(CPU_USAGE_PRECISION) : nil # pf accepts fractions 90% = 0.90
      }
    end

    {
      :clusterCpuUsage    => cluster_cpu_usage.presence,
      :clusterMemoryUsage => cluster_memory_usage.presence,
      :title              => _('Cluster Utilization'),
    }
  end

  def ems_utilization
    used_cpu = Hash.new(0)
    used_mem = Hash.new(0)
    total_cpu = Hash.new(0)
    total_mem = Hash.new(0)

    daily_provider_metrics.each do |metric|
      date = metric.timestamp.strftime("%Y-%m-%d")
      used_cpu[date] += metric.v_derived_cpu_total_cores_used if metric.v_derived_cpu_total_cores_used.present?
      used_mem[date] += metric.derived_memory_used if metric.derived_memory_used.present?
      total_cpu[date] += metric.derived_vm_numvcpus if metric.derived_vm_numvcpus.present?
      total_mem[date] += metric.derived_memory_available if metric.derived_memory_available.present?
    end

    format_utilization_data(used_cpu, used_mem, total_cpu, total_mem)
  end

  def daily_provider_metrics
    current_user = @controller.current_user
    tp = TimeProfile.profile_for_user_tz(current_user.id, current_user.get_timezone) || TimeProfile.default_time_profile

    @daily_metrics ||= begin
      metric_rollup_scope = MetricRollup.where(:capture_interval_name => 'daily', :time_profile => tp)
      metric_rollup_scope = metric_rollup_scope.where(:resource => @ems)
      metric_rollup_scope.where('timestamp > ?', 30.days.ago.utc).order('timestamp')
    end
  end
end
