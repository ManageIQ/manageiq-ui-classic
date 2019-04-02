class TreeBuilderCatalogsClass < TreeBuilder
  include CustomButtonsMixin
  has_kids_for CustomButtonSet, [:x_get_tree_aset_kids]

  private

  def x_get_tree_roots(count_only, _options)
    count_only_or_objects_filtered(count_only, ServiceTemplateCatalog.all, "name")
  end
end
