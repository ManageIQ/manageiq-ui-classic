class ResourcePoolInfraController < ResourcePoolController
  def self.model
    ResourcePool
  end

  def self.table_name
    @table_name ||= "resource_pool"
  end

  def index
    redirect_to(:action => 'show_list')
  end

  private

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Compute")},
        {:title => _("Infrastructure")},
        {:title => _("Resource Pools"), :url => controller_url},
      ],
    }
  end

  menu_section :inf
  feature_for_actions "#{controller_name}_show_list", *ADV_SEARCH_ACTIONS
end
