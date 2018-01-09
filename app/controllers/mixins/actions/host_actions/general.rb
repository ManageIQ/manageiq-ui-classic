module Mixins
  module Actions
    module HostActions
      module General
        def host_buttons(pressed)
          case pressed
          when 'host_scan'
            scanhosts
          when 'host_analyze_check_compliance'
            analyze_check_compliance_hosts
          when 'host_check_compliance'
            check_compliance_hosts
          when 'host_refresh'
            host_refresh
          when 'host_protect'
            assign_policies(Host)
          when 'host_delete'
            deletehosts
          when 'host_edit'
            edit_record
            return true # no further handling
          when 'storage_refresh'
            refreshstorage
            @refresh_div = 'main_div'
            return false # unfinished
          when 'storage_scan'
            scanstorage
            @refresh_div = 'main_div'
            return false # unfinished
          when 'storage_delete'
            deletestorages
            @refresh_div = 'main_div'
            return false # unfinished
          else
            if host_power_button?(pressed)
              handle_host_power_button(pressed)
              return false
            end
          end

          @refresh_div = "main_div"
          @refresh_partial = "layouts/gtl"
          false # no further processing
        end
      end
    end
  end
end
