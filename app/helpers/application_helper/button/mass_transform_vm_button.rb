class ApplicationHelper::Button::MassTransformVmButton < ApplicationHelper::Button::Basic

  def visible?
    true
  end

  def disabled?
    @error_message = _('No suitable target infra provider exists') unless destination_exists?
    @error_message.present?
  end

  def destination_exists?
    # Is there a provider that supports import?
    !EmsInfra.all.select(&:validate_import_vm).empty?
  end

end
