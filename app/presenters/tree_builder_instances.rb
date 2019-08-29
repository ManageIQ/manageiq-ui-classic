class TreeBuilderInstances < TreeBuilder
  has_kids_for ExtManagementSystem, [:x_get_tree_ems_kids]

  include TreeBuilderArchived

  def tree_init_options
    {:allow_reselect => true}
  end

  def root_options
    {
      :text    => _("Instances by Provider"),
      :tooltip => _("All Instances by Provider that I can see")
    }
  end

  def x_get_tree_roots
    count_only_or_objects_filtered(false, EmsCloud, "name", :match_via_descendants => VmCloud) +
      count_only_or_objects(false, x_get_tree_arch_orph_nodes("Instances"))
  end

  def x_get_tree_ems_kids(object, count_only)
    count_only_or_objects_filtered(count_only, object.availability_zones, "name")
  end
end
