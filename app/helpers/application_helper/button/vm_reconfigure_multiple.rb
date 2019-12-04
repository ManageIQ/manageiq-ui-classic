class ApplicationHelper::Button::VmReconfigureMultiple < ApplicationHelper::Button::Basic
  def visible?
    role_allows?(:feature => 'vm_reconfigure_all', :any => true)
  end
end
