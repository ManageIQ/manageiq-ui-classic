module ApplicationHelper::Toolbar::Mixins::CustomButtonToolbarMixin
  # FIXME: replace with CustomButton.button_classes
  # (ServiceTemplate, VmOrTemplate, GenericObjectDefinition are exceptions)
  APPLIES_TO_CLASS_BASE_MODELS = %w[AvailabilityZone CloudNetwork CloudObjectStoreContainer CloudSubnet CloudTenant
                                    CloudVolume ContainerGroup ContainerImage ContainerNode ContainerProject
                                    ContainerTemplate ContainerVolume EmsCluster ExtManagementSystem
                                    GenericObject GenericObjectDefinition Host LoadBalancer
                                    MiqGroup MiqTemplate NetworkRouter NetworkService  OrchestrationStack
                                    SecurityGroup SecurityPolicy SecurityPolicyRule Service ServiceTemplate Storage
                                    Switch Tenant User Vm VmOrTemplate].freeze

  def custom_button_appliable_class?(model)
    # FIXME: merge with model replacement in 'custom_button_class_model'
    model = "MiqTemplate" if model == "Image"
    model = "Vm" if model == "Instance"
    model = "ContainerVolume" if model == "PersistentVolume"
    model = "ExtManagementSystem" if model == "StorageManager"
    APPLIES_TO_CLASS_BASE_MODELS.include?(model)
  end

  def custom_button_class_model(applies_to_class)
    # TODO: Give a better name for this concept, including ServiceTemplate using Service
    #       'custom_button_appliable_class' -> 'display_to_model'
    # This should probably live in the model once this concept is defined.
    unless custom_button_appliable_class?(applies_to_class)
      raise ArgumentError, "Received: #{applies_to_class}, expected one of #{APPLIES_TO_CLASS_BASE_MODELS}"
    end

    case applies_to_class
    when "ServiceTemplate"
      Service
    when "PersistentVolume"
      ContainerVolume
    when "GenericObjectDefinition"
      GenericObject
    when "Instance"
      Vm
    when "Image"
      MiqTemplate
    when "StorageManager"
      ExtManagementSystem
    else
      applies_to_class.constantize
    end
  end

  # Indicates, whether the user has came from providers relationship screen
  # or not
  #
  # Used to
  # - indicate if the custom buttons should be rendered
  # - decide where to look for id of checked records
  def relationship_table_screen?
    return false if @display.nil?
    display_class = @display.camelize.singularize
    return false unless custom_button_appliable_class?(display_class)

    show_action = @lastaction == "show"
    display_model = custom_button_class_model(display_class)
    # method is accessed twice from a different location - from toolbar builder
    # and custom button mixin - and so controller class changes
    ctrl = self.class == ApplicationHelper::ToolbarBuilder ? controller : self
    controller_model = ctrl.class.model

    display_model != controller_model && show_action
  end
end
