module Mixins
  module PlaybookOptions
    def playbook_options_field_changed
      assert_privileges(params[:id] == 'new' ? 'ab_button_new' : 'ab_button_edit')
      @edit = session[:edit]
      @edit[:new][:inventory_type] = params[:inventory_type] if params[:inventory_type]
      playbook_box_edit

      render :update do |page|
        page << javascript_prologue
        if @edit[:new][:button_type] == 'ansible_playbook'
          page << javascript_show('playbook_div')
          page << if @edit[:new][:inventory_type] == "manual"
                    javascript_show('manual_inventory_div')
                  else
                    javascript_hide('manual_inventory_div')
                  end
        else
          page << javascript_hide('playbook_div')
        end

        @changed = session[:changed] = (@edit[:new] != @edit[:current])
        page << javascript_for_miq_button_visibility(@changed)

        page << "miqSparkle(false);"
      end
    end

    def dialog_for_service_template(service_template)
      service_template.resource_actions.each do |ra|
        d = Dialog.where(:id => ra.dialog_id).first
        @edit[:new][:dialog_id] = d.id if d
      end
    end

    def playbook_box_edit
      if params[:inventory_manual] || params[:inventory_localhost] || params[:inventory_event_target]
        update_playbook_variables(params)
      end
      if params[:service_template_id]
        @edit[:new][:service_template_id] = params[:service_template_id].to_i
        service_template = ServiceTemplate.find_by(:id => @edit[:new][:service_template_id])
        dialog_for_service_template(service_template) if service_template
      end

      @edit[:new][:hosts] = params[:hosts] if params[:hosts]
    end

    def update_playbook_variables(params)
      @edit[:new][:inventory_type] = params[:inventory_manual] if params[:inventory_manual]
      @edit[:new][:inventory_type] = params[:inventory_localhost] if params[:inventory_localhost]
      @edit[:new][:inventory_type] = params[:inventory_event_target] if params[:inventory_event_target]
      @edit[:new][:hosts] = '' if params[:inventory_localhost] || params[:inventory_event_target]
    end

    def clear_playbook_variables
      @edit[:new][:service_template_id] = nil
      @edit[:new][:inventory_type] = 'localhost'
      @edit[:new][:hosts] = ''
      @edit[:new][:object_request] = nil
    end

    def initialize_playbook_variables
      @edit[:new][:service_template_id] = nil
      @edit[:new][:inventory_type] = "localhost"
      @edit[:new][:hosts] = ''
    end
  end
end
