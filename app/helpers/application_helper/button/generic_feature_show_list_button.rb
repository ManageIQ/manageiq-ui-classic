class ApplicationHelper::Button::GenericFeatureShowListButton < ApplicationHelper::Button::ButtonNewDiscover
  def initialize(view_context, view_binding, instance_data, props)
    super
    @feature = props[:options][:feature]
    @managers = props[:options][:managers]
    @target_class = props[:options][:target_class]
  end

  def disabled?
    # @subclass can be under several managers (e.g. CloudVolume are under StorageManager and CloudManager).
    # If the feature is supported by one of the managers return false.
    @managers.each.none? do |manager|
      "ManageIQ::Providers::#{manager}".safe_constantize&.any? do |ems|
        "#{ems.class}::#{@target_class}".safe_constantize&.supports?(@feature)
      end
    end
  end
end
