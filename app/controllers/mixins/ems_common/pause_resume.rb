module Mixins
  module EmsCommon
    module PauseResume
      def call_ems_pause_resume(emss, options)
        action = if options[:resume]
                   "resume"
                 elsif options[:pause]
                   "pause"
                 end

        process_emss(emss, "#{action}_ems") unless emss.empty?
        return if @flash_array.present?

        add_flash(n_("%{action} initiated for %{count} %{model} from the %{product} Database",
                     "%{action} initiated for %{count} %{models} from the %{product} Database", emss.length) %
                    {:count   => emss.length,
                     :action  => action.capitalize,
                     :product => Vmdb::Appliance.PRODUCT_NAME,
                     :model   => ui_lookup(:table => table_name),
                     :models  => ui_lookup(:tables => table_name)})
      end

      def pause_or_resume_emss(options)
        assert_privileges(params[:pressed])
        # Test if multiple providers have been selected via checkboxes
        if params[:miq_grid_checks].present? || params.keys.any? { |k| k.starts_with?('check') }
          emss = find_checked_items
          if emss.empty?
            add_flash(_("No %{model} were selected for pause") % {:model => ui_lookup(:table => table_name)}, :error)
          end
          call_ems_pause_resume(emss, options)
          show_list
          @refresh_partial = "layouts/gtl"
        else # Single provider screen, no checkboxes
          if params[:id].nil? || model.find_by_id(params[:id]).nil?
            add_flash(_("%{record} no longer exists") % {:record => ui_lookup(:table => table_name)}, :error)
          else
            call_ems_pause_resume([params[:id]], options)
          end
          params[:display] = @display
        end
      end
    end
  end
end
