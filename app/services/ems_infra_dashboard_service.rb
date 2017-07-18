class EmsInfraDashboardService
  include UiServiceMixin
  CPU_USAGE_PRECISION = 2 # 2 decimal points

  def initialize(ems_id, controller)
    @ems_id = ems_id
    @ems = EmsInfra.find(@ems_id) unless @ems_id.blank?
    @controller = controller
  end

  def all_data
    {
      :providers_link  => get_url_to_entity(:ems_infra),
      :status          => status,
      :providers       => providers,
      :heatmaps        => heatmaps,
      :recentHosts     => recentHosts,
      :recentVms       => recentVms,
      :ems_utilization => ems_utilization,
    }.compact
  end

  def status
    status_hsh = {
      :ems_clusters  => {
        :title        => openstack? ? _('Deployment Roles') : _('Cluster'),
        :count        => @ems.present? ? @ems.ems_clusters.count : EmsCluster.count,
        :errorCount   => 0,
        :warningCount => 0,
        :href         => get_url_to_entity(:ems_cluster)
      },
      :hosts         => {
        :title        => openstack? ? _('Nodes') : _('Hosts'),
        :count        => @ems.present? ? @ems.hosts.count : Host.where.not(:ext_management_system => nil).count,
        :errorCount   => 0,
        :warningCount => 0,
        :href         => get_url_to_entity(:host)
      },
      :vms           => {
        :count        => @ems.present? ? @ems.vms.count : VmInfra.where.not(:ext_management_system => nil).count,
        :errorCount   => 0,
        :warningCount => 0,
        :href         => get_url_to_entity(:vm)
      },
      :miq_templates => {
        :count        => @ems.present? ?
          @ems.miq_templates.count : MiqTemplate.where.not(:ext_management_system => nil).count,
        :errorCount   => 0,
        :warningCount => 0,
        :href         => get_url_to_entity(:miq_template)
      }
    }
    unless openstack?
      status_hsh[:datastores] = {
        :count        => @ems.present? ? @ems.storages.count : Storage.count,
        :errorCount   => 0,
        :warningCount => 0,
        :href         => get_url_to_entity(:storage)
      }
    end

    status_hsh
  end

  def providers
    provider_classes_to_ui_types = ManageIQ::Providers::InfraManager.subclasses.each_with_object({}) { |subclass, h|
      name = subclass.name.split('::')[2]
      h[subclass.name] = name.to_sym
    }
    providers = @ems.present? ? {@ems.type => 1} : ManageIQ::Providers::InfraManager.group(:type).count

    result = {}
    providers.each do |provider, count|
      ui_type = provider_classes_to_ui_types[provider]
      (result[ui_type] ||= build_provider_status(ui_type))[:count] += count
    end
    result.values
  end

  def build_provider_status(provider_type)
    {
      :count     => 0,
      :iconImage => icons[provider_type][:icon]
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

  def heatmaps
    # Get latest hourly rollup for each node.
    cluster_ids = @ems.ems_clusters if @ems.present?
    metrics = MetricRollup.latest_rollups(EmsCluster.name, cluster_ids)
    metrics = metrics.where('timestamp > ?', 1.day.ago.utc).includes(:resource)
    metrics = metrics.includes(:resource => [:ext_management_system]) unless @ems.present?

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
        :percent  => m.cpu_usage_rate_average.present? ?
          (m.cpu_usage_rate_average / 100.0).round(CPU_USAGE_PRECISION) : nil # pf accepts fractions 90% = 0.90
      }

      cluster_memory_usage << {
        :id       => m.resource.id,
        :node     => m.resource.name,
        :provider => m.resource.ext_management_system.name,
        :unit     => "GB",
        :total    => m.derived_memory_available.present? ? (m.derived_memory_available / 1024).round : nil,
        :percent  => m.mem_usage_absolute_average.present? ?
          (m.mem_usage_absolute_average / 100.0).round(CPU_USAGE_PRECISION) : nil # pf accepts fractions 90% = 0.90
      }
    end

    {
      :clusterCpuUsage    => cluster_cpu_usage.presence,
      :clusterMemoryUsage => cluster_memory_usage.presence,
      :title              => openstack? ? _('Deployment Roles Utilization') : _('Cluster Utilization')
    }
  end

  def recentHosts
    # Get recent hosts
    all_hosts = recentRecords(Host)
      {
      :xData => all_hosts.keys,
      :yData => all_hosts.values.map,
      :title => openstack? ? _('Recent Nodes') : _('Recent Hosts'),
      :label => openstack? ? _('Nodes') : _('Hosts'),
    }
  end

  def recentVms
    # Get recent VMs
    all_vms = recentRecords(VmOrTemplate)
    {
      :xData => all_vms.keys,
      :yData => all_vms.values.map
    }
  end

  def recentRecords(model)
    all_records = Hash.new(0)
    records = model.where('created_on > ? and ems_id = ?', 30.days.ago.utc, @ems.id)
    records = records.includes(:resource => [:ext_management_system]) unless @ems.present?
    records.sort_by { |r| r.created_on }.uniq.each do |r|
      date = r.created_on.strftime("%Y-%m-%d")
      all_records[date] += model.where('created_on = ?', r.created_on).count
    end
    all_records
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
    else
      {
        :cpu => nil,
        :mem => nil
      }
    end
  end

  def daily_provider_metrics
    current_user = @controller.current_user
    tp = TimeProfile.profile_for_user_tz(current_user.id, current_user.get_timezone) || TimeProfile.default_time_profile

    @daily_metrics ||= Metric::Helper.find_for_interval_name('daily', tp)
                                     .where(:resource => (@ems || ManageIQ::Providers::InfraManager.all))
                                     .where('timestamp > ?', 30000.days.ago.utc).order('timestamp')
  end

  def openstack?
    @ems.kind_of?(ManageIQ::Providers::Openstack::InfraManager)
  end
end
