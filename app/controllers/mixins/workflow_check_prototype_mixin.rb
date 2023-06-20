module Mixins
  module WorkflowCheckPrototypeMixin
    private

    def check_prototype
      return if Settings.prototype.ems_workflows.enabled

      log_privileges(false, "Workflows are not enabled. The user is not authorized for this task or item.")
      raise MiqException::RbacPrivilegeException, _('The user is not authorized for this task or item.')
    end
  end
end
