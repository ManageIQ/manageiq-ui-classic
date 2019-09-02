class TreeBuilderButtons < TreeBuilderAeCustomization
  include CustomButtonsMixin
  include CustomButtonHelper

  has_kids_for CustomButtonSet, [:x_get_tree_aset_kids]

  private

  def tree_init_options
    {:open_all => true, :full_ids => true}
  end

  def root_options
    {
      :text    => t = _("Object Types"),
      :tooltip => t
    }
  end

  # Get root nodes count/array for explorer tree
  def x_get_tree_roots
    buttons = CustomButton.button_classes.map do |klass|
      name = target_class_name(klass)

      {
        :id   => "ab_#{klass}",
        :text => name,
        :tip  => name,
        :icon => klass.safe_constantize.try(:decorate).try(:fonticon)
      }
    end

    buttons.sort_by { |button| button[:text] }
  end

  def x_get_tree_custom_kids(object, count_only)
    nodes = object[:id].split('_')
    objects = CustomButtonSet.find_all_by_class_name(nodes[1])
    # add as first element of array
    objects.unshift(
      CustomButtonSet.new(:name => "[Unassigned Buttons]|ub-#{nodes[1]}", :description => "[Unassigned Buttons]")
    )
    count_only_or_objects(count_only, objects)
  end
end
