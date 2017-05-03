class TreeBuilderAutomationManagerConfigurationScripts < TreeBuilder
  has_kids_for ManageIQ::Providers::AnsibleTower::AutomationManager, [:x_get_tree_cmat_kids]
  attr_reader :tree_nodes

  private

  def tree_init_options(_tree_name)
    {:leaf => "ManageIQ::Providers::AnsibleTower::AutomationManager::ConfigurationScript"}
  end

  def set_locals_for_render
    locals = super
    locals.merge!(:autoload => true)
  end

  def root_options
    {
      :title   => t = _("All Ansible Tower Job Templates"),
      :tooltip => t
    }
  end

  # Get root nodes count/array for explorer tree
  def x_get_tree_roots(count_only, _options)
    roots = ManageIQ::Providers::AnsibleTower::AutomationManager
    count_only_or_objects_filtered(count_only, roots, "name", :match_via_descendants => ConfigurationScript)
  end

  def x_get_tree_cmat_kids(object, count_only)
    scripts = ManageIQ::Providers::AnsibleTower::AutomationManager::ConfigurationScript.where(:manager_id => object.id)
    count_only_or_objects_filtered(count_only, scripts, "name")
  end
end
