module ProvisionCustomizeHelper
  def disable_check?(workflow)
    ((!@options && @edit && @edit[:new] && @edit[:new][:sysprep_enabled] &&
      @edit[:new][:sysprep_enabled][0] && @edit[:new][:sysprep_enabled][0] != "disabled") ||
      (!@edit && @options && @options[:sysprep_enabled] &&
        @options[:sysprep_enabled][0] && @options[:sysprep_enabled][0] != "disabled")) &&
      !workflow.kind_of?(ManageIQ::Providers::Ovirt::InfraManager::ProvisionWorkflow)
  end

  def select_check?(workflow)
    (workflow.kind_of?(ManageIQ::Providers::Vmware::InfraManager::ProvisionWorkflow) ||
      workflow.kind_of?(ManageIQ::Providers::Ovirt::InfraManager::ProvisionWorkflow)) &&
      !workflow.supports_pxe? && !workflow.supports_iso?
  end
end
