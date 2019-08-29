class TreeBuilderAutomationManagerProviders < TreeBuilder
  has_kids_for ManageIQ::Providers::AnsibleTower::AutomationManager, [:x_get_tree_cmat_kids]
  has_kids_for ManageIQ::Providers::AutomationManager::InventoryRootGroup, [:x_get_tree_igf_kids]

  private

  def tree_init_options
    {:lazy => true}
  end

  def root_options
    {
      :text    => t = _("All Ansible Tower Providers"),
      :tooltip => t
    }
  end

  # Get root nodes count/array for explorer tree
  def x_get_tree_roots
    count_only_or_objects_filtered(false, ManageIQ::Providers::AnsibleTower::AutomationManager, "name")
  end

  def x_get_tree_cmat_kids(object, count_only)
    count_only_or_objects_filtered(count_only,
                                   ManageIQ::Providers::AutomationManager::InventoryGroup.where(:ems_id => object[:id]),
                                   "name", :match_via_descendants => ConfiguredSystem)
  end

  def x_get_tree_igf_kids(object, count_only)
    count_only_or_objects_filtered(count_only,
                                   ConfiguredSystem.where(:inventory_root_group_id=> object[:id]),
                                   "hostname")
  end
end
