module StiRoutingHelper
  include ActionDispatch::Routing::PolymorphicRoutes

  def ui_base_model(klass)
    if klass <= ExtManagementSystem
      klass.base_manager
    else
      klass.base_model
    end
  end

  def controller_for_model(klass)
    model = ui_base_model(klass)
    if klass <= VmOrTemplate
      controller_for_vm(klass) #TODO suspect, no model_for_vm? ; yup, it always returns vm_or_template without it; use allowed_controller_for_vm?
    elsif model.respond_to?(:db_name)
      model.db_name.underscore
    else
      model.name.underscore
    end
  end

  def polymorphic_path(record, *)
    if record.kind_of?(ActiveRecord::Base)
      klass = ui_base_model(record.class)
      record = record.becomes(klass) unless record.class == klass
    end
    super
  end

  def polymorphic_url(record, *)
    if record.kind_of?(ActiveRecord::Base)
      klass = ui_base_model(record.class)
      record = record.becomes(klass) unless record.class == klass
    end
    super
  end
end
