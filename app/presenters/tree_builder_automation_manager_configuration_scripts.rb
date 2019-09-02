class TreeBuilderAutomationManagerConfigurationScripts < TreeBuilder
  include TreeBuilderFiltersMixin
  has_kids_for ManageIQ::Providers::AnsibleTower::AutomationManager, [:x_get_tree_cmat_kids]

  private

  def tree_init_options
    {:lazy => true}
  end

  def root_options
    {
      :text    => t = _("All Ansible Tower Templates"),
      :tooltip => t
    }
  end

  # Get root nodes count/array for explorer tree
  def x_get_tree_roots
    objects = []
    templates = Rbac.filtered(ManageIQ::Providers::AnsibleTower::AutomationManager.order("lower(name)"), :match_via_descendants => ConfigurationScript)

    templates.each do |temp|
      objects.push(temp)
    end

    count_only_or_objects(false, objects + FILTERS.values)
  end

  def x_get_tree_cmat_kids(object, count_only)
    scripts = ConfigurationScript.where(:manager_id => object.id)
    count_only_or_objects_filtered(count_only, scripts, "name")
  end

  def x_get_tree_custom_kids(object, count_only)
    count_only_or_filter_kids("ConfigurationScript", object, count_only)
  end
end
