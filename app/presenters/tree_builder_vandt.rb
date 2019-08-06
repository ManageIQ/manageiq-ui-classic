class TreeBuilderVandt < TreeBuilder
  include TreeBuilderArchived

  private

  def tree_init_options
    {
      :allow_reselect => true
    }
  end

  def root_options
    {
      :text    => _("All VMs & Templates"),
      :tooltip => _("All VMs & Templates that I can see")
    }
  end

  def x_get_tree_roots(count_only)
    roots = count_only_or_objects_filtered(count_only, EmsInfra, "name", :match_via_descendants => VmOrTemplate)
    arch_orph = count_only_or_objects(count_only, x_get_tree_arch_orph_nodes("VMs and Templates"))

    return roots + arch_orph if count_only

    roots.each_with_object({}) do |ems, nodes|
      nodes.merge!(relationship_tree(ems))
    end.merge(arch_orph.each_with_object({}) { |item, nodes| nodes[item] = {} })
  end

  def relationship_tree(ems)
    # TODO: Do more to pre-prune the tree.
    # - Perhaps only get the folders, then prune those based on RBAC and let
    #   the UI still do the lazy loading of individual folders.  This can be
    #   possibly done by querying the relationship tree only, and then only
    #   converting the folders to real objects.  For the VMs we only need ids,
    #   so taking them from the relationship records can cut down on the huge
    #   VM query.

    tree = ems.subtree_arranged(:except_type => "VmOrTemplate")

    prune_rbac(ems, tree)
    prune_non_vandt_folders(tree)
    reparent_hidden_folders(tree)
    sort_tree(tree)

    tree
  end

  def prune_non_vandt_folders(tree, parent = nil)
    tree.reject! do |object, children|
      prune_non_vandt_folders(children, object)
      parent.kind_of?(Datacenter) && object.kind_of?(EmsFolder) && object.name != "vm"
    end
  end

  def hidden_child_folder?(_object, children)
    return false unless children.length == 1
    child = children.keys.first
    child.kind_of?(EmsFolder) && child.hidden?
  end

  def reparent_hidden_folders(tree)
    tree.each do |object, children|
      if hidden_child_folder?(object, children)
        children     = children.values.first
        tree[object] = children
      end
      reparent_hidden_folders(children)
    end
  end

  def prune_rbac(ems, tree)
    allowed_vms = Rbac.filtered(ems.vms) # this is a sub-query
    vm_relations = Relationship.where(:resource     => allowed_vms,
                                      :relationship => "ems_metadata")
                               .select(:ancestry).distinct # bigger sub-query
                               .map(&:parent_id)
    allowed_folder_ids = Relationship.where(:id => vm_relations).pluck(:resource_id)
    prune_folders_via_folders(tree, allowed_folder_ids)
  end

  def prune_folders_via_vms(tree, allowed_vm_ids)
    tree.reject! do |object, children|
      prune_folders_via_vms(children, allowed_vm_ids)
      if object.kind_of?(VmOrTemplate)
        !allowed_vm_ids.include?(object.id)
      elsif object.kind_of?(EmsFolder)
        children.empty?
      end
    end
  end

  def prune_folders_via_folders(tree, allowed_folder_ids)
    has_sub_folders = false
    tree.select! do |object, children|
      has_sub_sub_folders = prune_folders_via_folders(children, allowed_folder_ids)

      next(true) unless object.kind_of?(EmsFolder)
      keep_folder = has_sub_sub_folders || allowed_folder_ids.include?(object.id)
      has_sub_folders = true if keep_folder
      keep_folder
    end
    has_sub_folders
  end

  # Datacenters will sort before normal folders via the sort_tree method
  SORT_CLASSES = [ExtManagementSystem, EmsFolder, VmOrTemplate].freeze

  def sort_tree(tree)
    tree.keys.each do |object|
      tree[object] = sort_tree(tree[object])
    end

    tree.sort_by! do |object, _children|
      datacenter = object.kind_of?(Datacenter)
      [SORT_CLASSES.index(object.class.base_class), datacenter ? 0 : 1, object.name.downcase]
    end
  end
end
