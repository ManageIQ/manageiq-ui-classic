class ContainerProjectDashboardService
  include UiServiceMixin
  include ContainerServiceMixin
  CPU_USAGE_PRECISION = 2 # 2 decimal points

  def initialize(project_id, controller)
    @project_id = project_id
    @project = ContainerProject.find(@project_id)
    @resource = @project
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

  def project_utilization
    empty_utilization_trend_data
  end

  def network_metrics
    empty_network_trend_data
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
end
