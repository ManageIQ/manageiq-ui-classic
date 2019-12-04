class ApplicationHelper::Button::VmReconfigure < ApplicationHelper::Button::Basic
  needs :@record

  def visible?
    role_allows?(:feature => 'vm_reconfigure_all', :any => true) && @record.reconfigurable?
  end
end
