class TreeBuilderCatalogsClass < TreeBuilder
  include CustomButtonsMixin
  has_kids_for CustomButtonSet, [:x_get_tree_aset_kids]

  private

  def x_get_tree_roots(count_only, options)
    objects = count_only_or_objects_filtered(count_only, ServiceTemplateCatalog.all, "name")
    case options[:type]
    when :stcat
      objects
    when :sandt
      if count_only
        objects + 1
      else
        objects.unshift(ServiceTemplateCatalog.new(
                          :name        => 'Unassigned',
                          :description => 'Unassigned Catalogs'
        ))
      end
    end
  end
end
