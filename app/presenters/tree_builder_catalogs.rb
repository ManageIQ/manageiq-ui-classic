class TreeBuilderCatalogs < TreeBuilderCatalogsClass
  private

  def tree_init_options(_tree_name)
    {:full_ids => true, :leaf => 'ServiceTemplateCatalog'}
  end

  def set_locals_for_render
    locals = super
    locals.merge!(:autoload => 'true')
  end

  def root_options
    {
      :title   => t = _("All Catalogs"),
      :tooltip => t
    }
  end
end
