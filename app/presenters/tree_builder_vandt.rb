class TreeBuilderVandt < TreeBuilder
  include TreeBuilderArchived

  def tree_init_options
    {
      :lazy           => true,
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
    objects = count_only_or_objects_filtered(count_only, EmsInfra, "name", :match_via_descendants => VmOrTemplate)
    objects.collect! { |o| TreeBuilderVmsAndTemplates.new(o, options.dup).tree } unless count_only
    root_nodes = count_only_or_objects(count_only, x_get_tree_arch_orph_nodes("VMs and Templates"))

    objects + root_nodes
  end

  def x_get_child_nodes(id)
    model, _, prefix = self.class.extract_node_model_and_id(id)
    model == "Hash" ? super : find_child_recursive(x_get_tree_roots(false, {}), id)
  end

  private

  def find_child_recursive(nodes, id)
    nodes.each do |t|
      return t[:nodes] if t[:key] == id

      found = find_child_recursive(t[:nodes], id) if t[:nodes]
      return found unless found.nil?
    end
    nil
  end
end
