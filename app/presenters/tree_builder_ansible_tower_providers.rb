class TreeBuilderAnsibleTowerProviders < TreeBuilder
  has_kids_for ManageIQ::Providers::AnsibleTower::ConfigurationManager, [:x_get_tree_cmat_kids]
  has_kids_for ManageIQ::Providers::ConfigurationManager::InventoryRootGroup, [:x_get_tree_igf_kids]

  private

  def tree_init_options(_tree_name)
    {:leaf => "ManageIQ::Providers::AnsibleTower::ConfigurationManager"}
  end

  def set_locals_for_render
    locals = super
    locals.merge!(:autoload => true)
  end

  def root_options
    {
      :title   => t = _("All Ansible Tower Providers"),
      :tooltip => t
    }
  end

  # Get root nodes count/array for explorer tree
  def x_get_tree_roots(count_only, _options)
    count_only_or_objects_filtered(count_only, ManageIQ::Providers::AnsibleTower::ConfigurationManager, "name", :match_via_descendants => ConfiguredSystem)
  end

  def x_get_tree_cmat_kids(object, count_only)
    count_only_or_objects_filtered(count_only,
                                   ManageIQ::Providers::ConfigurationManager::InventoryGroup.where(:ems_id => object[:id]),
                                   "name", :match_via_descendants => ConfiguredSystem)
  end

  def x_get_tree_igf_kids(object, count_only)
    count_only_or_objects_filtered(count_only,
                                   ConfiguredSystem.where(:inventory_root_group_id=> object[:id]),
                                   "hostname", :match_via_descendants => ConfiguredSystem)
  end
end
