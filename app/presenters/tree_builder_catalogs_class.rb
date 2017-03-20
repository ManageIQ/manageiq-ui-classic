class TreeBuilderCatalogsClass < TreeBuilder
  include CustomButtonsMixin
  has_kids_for CustomButtonSet, [:x_get_tree_aset_kids]

  private

  def x_get_tree_roots(count_only, options)
    objects = Rbac.filtered(ServiceTemplateCatalog.all).sort_by { |o| o.name.downcase }
    case options[:type]
    when :stcat
      return count_only_or_objects(count_only, objects)
    when :sandt
      return count_only_or_objects(
        count_only,
        objects.unshift(ServiceTemplateCatalog.new(
          :name        => 'Unassigned',
          :description => 'Unassigned Catalogs')),
         nil
      )
    end
  end
end
