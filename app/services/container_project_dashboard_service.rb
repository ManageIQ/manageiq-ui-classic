class ContainerProjectDashboardService < DashboardService
  include ContainerServiceMixin
  include Mixins::CheckedIdMixin

  def initialize(project_id, controller)
    @project_id = project_id
    @project = find_record_with_rbac(ContainerProject, @project_id)
    @resource = @project
    @controller = controller
  end

  def display_precision
    2
  end

  def all_data
    {
      :status              => status,
      :project_utilization => project_utilization,
      :network_metrics     => project_network_metrics,
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
        :href         => @controller.url_for(:controller => "container_project",
                                             :action     => "show",
                                             :id         => @project.id,
                                             :display    => "containers")
      },
    }
  end

  def project_utilization
    daily_utilization || hourly_utilization || empty_utilization_trend_data
  end

  def project_network_metrics
    daily_network_metrics || hourly_network_metrics || empty_network_trend_data
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
    @project.container_quota_items.collect do |quota_item|
      enforced = quota_item.quota_enforced
      observed = quota_item.quota_observed
      enforced = enforced.to_i if (enforced % 1).zero?
      observed = observed.to_i if (observed % 1).zero?

      units = ""

      if quota_item.resource.include?("cpu")
        units = "Cores"
      elsif quota_item.resource.include?("memory")
        units = "GB"
        enforced /= 1.gigabytes
        observed /= 1.gigabytes
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
