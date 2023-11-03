class ResourcePoolCloudController < ResourcePoolController
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
        {:title => _("Clouds")},
        {:title => _("Resource Pools"), :url => controller_url},
      ],
    }
  end

  menu_section :clo
  feature_for_actions "#{controller_name}_show_list", *ADV_SEARCH_ACTIONS
end
