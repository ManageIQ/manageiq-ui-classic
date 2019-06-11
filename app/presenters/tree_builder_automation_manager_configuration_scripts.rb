class TreeBuilderAutomationManagerConfigurationScripts < TreeBuilder
  has_kids_for ManageIQ::Providers::AnsibleTower::AutomationManager, [:x_get_tree_cmat_kids]
  attr_reader :tree_nodes

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
  def x_get_tree_roots(count_only)
    objects = []
    templates = Rbac.filtered(ManageIQ::Providers::AnsibleTower::AutomationManager.order("lower(name)"), :match_via_descendants => ConfigurationScript)

    templates.each do |temp|
      objects.push(temp)
    end

    objects.push(:id         => "global",
                 :text       => _("Global Filters"),
                 :icon       => "pficon pficon-folder-close",
                 :tip        => _("Global Shared Filters"),
                 :selectable => false)
    objects.push(:id         => "my",
                 :text       => _("My Filters"),
                 :icon       => "pficon pficon-folder-close",
                 :tip        => _("My Personal Filters"),
                 :selectable => false)
    count_only_or_objects(count_only, objects)
  end

  def x_get_tree_cmat_kids(object, count_only)
    scripts = ConfigurationScript.where(:manager_id => object.id)
    count_only_or_objects_filtered(count_only, scripts, "name")
  end

  def x_get_tree_custom_kids(object, count_only, options)
    objects = MiqSearch.where(:db => "ConfigurationScript").filters_by_type(object[:id])
    count_only_or_objects(count_only, objects, 'description')
  end
end
