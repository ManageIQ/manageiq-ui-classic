module Mixins
  module MoreShowActions
    include Mixins::ComplianceHistoryMixin

    def show_timeline
      @showtype = "timeline"
      @layout = 'timeline'
      session[:tl_record_id] = params[:id] if params[:id]
      @lastaction = "show_timeline"
      @timeline = @timeline_filter = true
      tl_build_timeline # Create the timeline report
      drop_breadcrumb(:name => _("Timelines for %{table} \"%{name}\"") % {:table => ui_lookup(:table => controller_name), :name => @record.name},
                      :url  => "/#{controller_name}/show/#{@record.id}" \
                               "?refresh=n&display=timeline")
    end

    def show_performance
      @showtype = "performance"
      display_name = @record.respond_to?(:evm_display_name) ? @record.evm_display_name : @record.name
      drop_breadcrumb(:name => _("%{name} Capacity & Utilization") % {:name => display_name},
                      :url  => "/#{controller_name}/show/#{@record.id}" \
                               "?display=#{@display}&refresh=n")
      perf_gen_init_options # Initialize options, charts are generated async
    end

    def show_compliance_history
      count = params[:count] ? params[:count].to_i : 10
      @compliance_checks = serialize_compliance_history(@record, count)
      drop_breadcrumb_for_compliance_history(count)
      @showtype = @display
    end

    def drop_breadcrumb_for_compliance_history(count)
      if count == 1
        drop_breadcrumb(:name => _("%{name} (Compliance Status)") % {:name => @record.name},
                        :url  => "/#{controller_name}/show/#{@record.id}?display=#{@display}&refresh=n")
      else
        drop_breadcrumb(
          :name => _("%{name} (Compliance History - Last %{number} Checks)") % {:name => @record.name, :number => count},
          :url  => "/#{controller_name}/show/#{@record.id}?display=#{@display}&refresh=n"
        )
      end
    end
  end
end
