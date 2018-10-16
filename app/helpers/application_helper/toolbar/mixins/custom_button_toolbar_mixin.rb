module ApplicationHelper::Toolbar::Mixins::CustomButtonToolbarMixin
  APPLIES_TO_CLASS_BASE_MODELS = %w(AvailabilityZone CloudNetwork CloudObjectStoreContainer CloudSubnet CloudTenant
                                    CloudVolume ContainerGroup ContainerImage ContainerNode ContainerProject
                                    ContainerTemplate ContainerVolume EmsCluster ExtManagementSystem
                                    GenericObject GenericObjectDefinition Host LoadBalancer
                                    MiqGroup MiqTemplate NetworkRouter OrchestrationStack SecurityGroup Service
                                    ServiceTemplate Storage Switch Tenant User Vm VmOrTemplate).freeze

  def custom_button_appliable_class?(model)
    APPLIES_TO_CLASS_BASE_MODELS.include?(model)
  end

  def custom_button_class_model(applies_to_class)
    # TODO: Give a better name for this concept, including ServiceTemplate using Service
    # This should probably live in the model once this concept is defined.
    unless custom_button_appliable_class?(applies_to_class)
      raise ArgumentError, "Received: #{applies_to_class}, expected one of #{APPLIES_TO_CLASS_BASE_MODELS}"
    end

    case applies_to_class
    when "ServiceTemplate"
      Service
    when "GenericObjectDefinition"
      GenericObject
    else
      applies_to_class.constantize
    end
  end

  # Indicates, whether the user has came from providers relationship screen
  # or not
  #
  # Used to indicate if the custom buttons should be rendered
  def relationship_table_screen?
    return false if @display.nil? || @record.nil?

    display_model = @display.camelize.singularize
    providers = (EmsCloud.descendants +
                 EmsInfra.descendants +
                 EmsPhysicalInfra.descendants +
                 ManageIQ::Providers::ContainerManager.descendants)

    custom_button_model = custom_button_appliable_class?(display_model)
    provider_screen = providers.any? { |provider| @record.instance_of?(provider) }
    show_action = @lastaction == "show"

    custom_button_model && provider_screen && show_action
  end
end
