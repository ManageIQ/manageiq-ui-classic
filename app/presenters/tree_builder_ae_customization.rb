class TreeBuilderAeCustomization < TreeBuilder
  private

  def tree_init_options
    {:open_all => true}
  end

  def root_options
    {
      :text    => t = _("Service Dialog Import/Export"),
      :tooltip => t
    }
  end

  def x_get_tree_roots
    count_only_or_objects(false, nil)
  end
end
