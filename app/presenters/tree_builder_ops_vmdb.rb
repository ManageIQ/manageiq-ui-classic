class TreeBuilderOpsVmdb < TreeBuilder
  has_kids_for VmdbTableEvm, %i[x_get_tree_vmdb_table_kids]

  private

  def tree_init_options
    {:lazy => true}
  end

  def root_options
    {
      :text    => t = _("VMDB"),
      :tooltip => t,
      :icon    => 'fa fa-database'
    }
  end

  # Get root nodes count/array for explorer tree
  def x_get_tree_roots(count_only)
    objects = Rbac.filtered(VmdbDatabase.my_database.try(:evm_tables).to_a).to_a
    count_only_or_objects(count_only, objects, "name")
  end

  # Handle custom tree nodes (object is a Hash)
  def x_get_tree_vmdb_table_kids(object, count_only)
    vmdb_indexes = VmdbIndex.includes(:vmdb_table).where(:vmdb_tables => {:type => 'VmdbTableEvm', :id => object.id})
    count_only_or_objects(count_only, vmdb_indexes, "name")
  end
end
