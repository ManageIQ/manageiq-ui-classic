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
    objects = count_only_or_objects_filtered(count_only, EmsInfra, "name", :match_via_descendants => VmOrTemplate)
    objects.collect! { |o| TreeBuilderVmsAndTemplates.new(o, options.dup).tree } unless count_only
    root_nodes = count_only_or_objects(count_only, x_get_tree_arch_orph_nodes("VMs and Templates"))

    objects + root_nodes
  end
end
