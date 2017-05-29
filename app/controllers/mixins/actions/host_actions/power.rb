module Mixins
  module Actions
    module HostActions
      module Power
        # Handle the Host power buttons
        POWER_BUTTON_NAMES = {
          "reboot"           => _("Restart"),
          "start"            => _("Power On"),
          "stop"             => _("Power Off"),
          "enter_maint_mode" => _("Enter Maintenance Mode"),
          "exit_maint_mode"  => _("Exit Maintenance Mode"),
          "standby"          => _("Shutdown to Standby Mode")
        }

        def powerbutton_hosts(method)
          assert_privileges(params[:pressed])
          host_button_operation(method, POWER_BUTTON_NAMES[method] || method.titleize)
        end
      end
    end
  end
end

