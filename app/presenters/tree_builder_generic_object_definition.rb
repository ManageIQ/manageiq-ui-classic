class TreeBuilderGenericObjectDefinition < TreeBuilder
  has_kids_for GenericObjectDefinition, [:x_get_god_kids]
  include CustomButtonsMixin
  has_kids_for CustomButtonSet, [:x_get_tree_aset_kids]

  private

  def root_options
    {
      :text    => t = _('All Generic Object Definitions'),
      :tooltip => t
    }
  end

  def x_get_tree_roots
    count_only_or_objects(false, GenericObjectDefinition.all, :name)
  end

  def x_get_god_kids(object, count_only)
    count_only_or_objects(count_only, object.custom_button_sets.sort_by(&:name) + object.custom_buttons)
  end

  def tree_init_options
    {}
  end
end
