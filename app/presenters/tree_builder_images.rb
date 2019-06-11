class TreeBuilderImages < TreeBuilder
  include TreeBuilderArchived

  def tree_init_options
    {
      :lazy           => true,
      :allow_reselect => true
    }
  end

  def root_options
    {
      :text    => _("Images by Provider"),
      :tooltip => _("All Images by Provider that I can see")
    }
  end

  def x_get_tree_roots(count_only)
    count_only_or_objects_filtered(count_only, EmsCloud, "name", :match_via_descendants => TemplateCloud) +
      count_only_or_objects(count_only, x_get_tree_arch_orph_nodes("Images"))
  end
end
