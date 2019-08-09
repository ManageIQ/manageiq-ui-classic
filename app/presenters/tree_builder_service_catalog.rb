class TreeBuilderServiceCatalog < TreeBuilderCatalogsClass
  has_kids_for ServiceTemplateCatalog, [:x_get_tree_stc_kids]

  private

  def tree_init_options
    {:full_ids => true, :lazy => true}
  end

  def root_options
    {
      :text    => t = _("All Services"),
      :tooltip => t
    }
  end

  def x_get_tree_roots(count_only)
    includes = {:tenant => {}, :service_templates => {}}
    objects = Rbac.filtered(ServiceTemplateCatalog, :include_for_find => includes).sort_by { |o| o.name.downcase }
    filtered_objects = []
    # only show catalogs nodes that have any servicetemplate records under them
    objects.each do |object|
      items = Rbac.filtered(object.service_templates, :named_scope => %i[displayed public_service_templates])
      filtered_objects.push(object) unless items.empty?
    end
    count_only_or_objects(count_only, filtered_objects, 'name')
  end

  def x_get_tree_stc_kids(object, count_only)
    objects = Rbac.filtered(object.service_templates, :named_scope => %i[displayed public_service_templates])
    count_only_or_objects(count_only, objects, 'name')
  end
end
