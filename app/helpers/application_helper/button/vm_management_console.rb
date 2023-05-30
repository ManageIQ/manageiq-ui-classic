class ApplicationHelper::Button::VmManagementConsole < ApplicationHelper::Button::Basic
  needs :@record

  def visible?
    @record.vendor == 'ibm_power_hmc'
  end
end
