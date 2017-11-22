class ApplicationHelper::Button::TransformVmButton < ApplicationHelper::Button::Basic
  needs :@record

  def visible?
    @record.vendor == "vmware"
  end

  def disabled?
    @error_message = _('No suitable target infra provider exists') unless destination_exists?
    @error_message = _('Can only transform VMs in down state') unless vm_down?
    @error_message = _('Cannot transform VMs with snapshots') if vm_has_snapshots?
    @error_message.present?
  end

  def destination_exists?
    # Is there a provider that supports import?
    !EmsInfra.all.select(&:supports_vm_import?).empty?
  end

  def vm_down?
    @record.state == 'off'
  end

  def vm_has_snapshots?
    !@record.snapshots.empty?
  end
end
