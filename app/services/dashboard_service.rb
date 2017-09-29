class DashboardService
  include UiServiceMixin

  class << self
    attr_reader :provider_base_class
  end

  def providers
    provider_classes_to_ui_types = self.class.provider_base_class.subclasses.each_with_object({}) do |subclass, h|
      name = subclass.name.split('::')[2]
      h[subclass.name] = name.to_sym
    end
    providers = @ems.present? ? {@ems.type => 1} : self.class.provider_base_class.group(:type).count

    result = {}
    providers.each do |provider, count|
      ui_type = provider_classes_to_ui_types[provider]
      (result[ui_type] ||= build_provider_status(ui_type))[:count] += count
    end
    result.values
  end
end
