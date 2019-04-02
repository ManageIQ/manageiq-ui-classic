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
        }.freeze

        def powerbutton_hosts(method)
          assert_privileges(params[:pressed])
          host_button_operation(method, POWER_BUTTON_NAMES[method] || method.titleize)
        end

        def host_power_button?(button_code)
          %w(host_shutdown host_reboot host_standby host_enter_maint_mode
             host_exit_maint_mode host_start host_stop host_reset).include?(button_code)
        end

        def handle_host_power_button(button_code)
          match = button_code.match(/^host_/)
          return unless match

          powerbutton_hosts(match.post_match)
        end
      end
    end
  end
end
