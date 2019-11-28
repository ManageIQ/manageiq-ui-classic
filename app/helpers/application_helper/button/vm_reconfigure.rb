class ApplicationHelper::Button::VmReconfigure < ApplicationHelper::Button::Basic
  needs :@record

  def visible?
    role_allows_any?(:identifiers => %w(vm_reconfigure_cpu vm_reconfigure_memory vm_reconfigure_networks vm_reconfigure_disks)) && @record.reconfigurable?
  end
end
