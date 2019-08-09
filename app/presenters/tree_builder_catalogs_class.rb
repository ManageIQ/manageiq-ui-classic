class TreeBuilderCatalogsClass < TreeBuilder
  include CustomButtonsMixin
  has_kids_for CustomButtonSet, [:x_get_tree_aset_kids]

  private

  def node_by_tree_id(id)
    # Creating empty record to show items under unassigned catalogs
    super(id) || ServiceTemplateCatalog.new
  end

  def x_get_tree_roots(count_only)
    count_only_or_objects_filtered(count_only, ServiceTemplateCatalog.all, "name")
  end
end
