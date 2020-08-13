module Mixins
  module PolicyMixin
    def send_button_changes
      if @edit
        @changed = (@edit[:new] != @edit[:current])
      elsif @assign
        @changed = (@assign[:new] != @assign[:current])
      end
      render :update do |page|
        page << javascript_prologue
        if @edit
          if @refresh_inventory
            page.replace("action_options_div", :partial => "action_options")
          end
          if @action_type_changed || @snmp_trap_refresh
            page.replace("action_options_div", :partial => "action_options")
          elsif @alert_refresh
            page.replace("alert_details_div",  :partial => "alert_details")
          elsif @to_email_refresh
            page.replace("edit_to_email_div",
                         :partial => "layouts/edit_to_email",
                         :locals  => {:action_url => "alert_field_changed", :record => @alert})
          elsif @alert_snmp_refresh
            page.replace("alert_snmp_div", :partial => "alert_snmp")
          elsif @alert_mgmt_event_refresh
            page.replace("alert_mgmt_event_div", :partial => "alert_mgmt_event")
          end
        elsif @assign
          if params.key?(:chosen_assign_to) || params.key?(:chosen_cat)
            page.replace("alert_profile_assign_div", :partial => "alert_profile_assign")
          end
        end
        page << javascript_for_miq_button_visibility_changed(@changed)
        page << "miqSparkle(false);"
      end
    end
  end
end
