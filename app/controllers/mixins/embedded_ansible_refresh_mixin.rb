module Mixins
  module EmbeddedAnsibleRefreshMixin
    def embedded_ansible_refresh(objects = nil)
      objects = [ManageIQ::Providers::EmbeddedAnsible::AutomationManager.in_my_region.first] if objects.nil?
      begin
        EmsRefresh.queue_refresh_task(objects)
        add_flash(_("Embedded Ansible refresh has been successfully initiated"))
      rescue => ex
        add_flash(_("An error occurred while initiating Embedded Ansible refresh: %{error}") % {:error => ex}, :error)
      end
    end
  end
end
