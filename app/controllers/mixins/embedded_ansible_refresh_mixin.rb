module Mixins
  module EmbeddedAnsibleRefreshMixin
    def embedded_ansible_refresh
      begin
        embedded_ansible = ManageIQ::Providers::EmbeddedAnsible::AutomationManager.first
        ManageIQ::Providers::EmbeddedAnsible::AutomationManager.refresh_ems([embedded_ansible.id])
        add_flash(_("Embedded Ansible Provider refresh has been successfully initiated"))
      rescue => ex
        add_flash(_("An error occurred while initiating Embedded Ansible Provider refresh: %{error}") % {:error => ex}, :error)
      end
      session[:flash_msgs] = @flash_array
      javascript_redirect :action => 'show_list'
    end
  end
end
