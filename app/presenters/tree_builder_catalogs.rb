class TreeBuilderCatalogs < TreeBuilderCatalogsClass
  private

  def tree_init_options
    {:full_ids => true}
  end

  def set_locals_for_render
    locals = super
    locals.merge!(:autoload => 'true')
  end

  def root_options
    {
      :text    => t = _("All Catalogs"),
      :tooltip => t
    }
  end
end
