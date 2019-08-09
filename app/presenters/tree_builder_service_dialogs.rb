class TreeBuilderServiceDialogs < TreeBuilderAeCustomization
  def tree_init_options
    {:open_all => true}
  end

  def root_options
    {
      :text    => t = _("All Dialogs"),
      :tooltip => t
    }
  end

  # Get root nodes count/array for explorer tree
  def x_get_tree_roots(count_only)
    objects = Rbac.filtered(Dialog.all).sort_by { |a| a.label.downcase }
    count_only_or_objects(count_only, objects)
  end
end
