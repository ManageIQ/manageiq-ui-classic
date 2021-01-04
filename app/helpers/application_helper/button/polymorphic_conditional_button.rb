class ApplicationHelper::Button::PolymorphicConditionalButton < ApplicationHelper::Button::Basic
  def initialize(view_context, view_binding, instance_data, props)
    super
    @feature = props[:options][:feature]
    @parent_class = props[:options][:parent_class]
  end

  def child_classes
    @parent_class.safe_constantize.descendants
  end

  def disabled?
    # @child_classes can be under several managers (e.g. CloudVolume are under StorageManager and CloudManager).
    # If the feature is supported by one of the managers return false.
    child_classes.each.none? do |manager|
      manager.any? do |ems|
        ems.supports?(@feature)
      end
    end
  end
end
