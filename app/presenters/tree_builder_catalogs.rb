class TreeBuilderCatalogs < TreeBuilderCatalogsClass
  private

  def tree_init_options
    {:full_ids => true, :lazy => true}
  end

  def root_options
    {
      :text    => t = _("All Catalogs"),
      :tooltip => t
    }
  end
end
