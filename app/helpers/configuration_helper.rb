module ConfigurationHelper
  include_concern 'ConfigurationViewHelper'

  # Model class name comparison method that sorts provider models first
  def compare_decorator_class(a, b)
    if a.to_s.starts_with?('ManageIQ::Providers') == b.to_s.starts_with?('ManageIQ::Providers')
      a.to_s <=> b.to_s
    elsif a.to_s.starts_with?('ManageIQ::Providers')
      -1
    elsif b.to_s.starts_with?('ManageIQ::Providers')
      1
    end
  end

  # Returns with a hash of allowed quadicons for the current user
  def allowed_quadicons
    MiqDecorator.descendants # Get all the decorator classes
                .select { |klass| klass.instance_methods(false).include?(:quadicon) } # Select only the decorators that define a quadicon
                .sort(&method(:compare_decorator_class))
                .map do |decorator|
      # Get the model name by removing Decorator from the class name
      klass = decorator.to_s.chomp('Decorator')
      # Retrieve the related root feature node
      feature = klass.constantize.model_name.singular_route_key.to_sym
      # Just return nil if the feature is not allowed for the current user
      next unless role_allows?(:feature => feature, :any => true)

      [klass.demodulize.underscore.to_sym, ui_lookup(:model => klass)]
    end.compact.to_h
  end
end
