module Mixins
  module AutomationMixin
    # Returns an object to identify the entry_point types
    ENTRY_POINT_TYPES = {
      :fqname             => {:type => :provision,   :name => 'Provision'},
      :reconfigure_fqname => {:type => :reconfigure, :name => 'Reconfigure'},
      :retire_fqname      => {:type => :retire,      :name => 'Retirement'},
      :namespace          => {:type => :namespace,   :name => 'Namespace'}
    }.freeze

    # Returns an object to be resued for passing down to rails form and angular form.
    # Used in catalogs_helper, miq_ae_customization_helper, catalog_controller, editor.html.haml
    AUTOMATION_TYPES = {
      :automate => {
        :key    => 'embedded_automate',
        :label  => _('Embedded Automate'),
        :fields => ['ae_namespace', 'ae_class', 'ae_instance', 'ae_message', 'ae_attributes'],
      },
      :workflow => {
        :key    => 'embedded_workflow',
        :label  => _('Embedded Workflow'),
        :fields => ['configuration_script_id', 'workflow_name'],
      },
    }.freeze

    # Returns an array of entry point options.
    # used in provision_entry_poins, retirement_entry_points, reconfigure_entry_points html files
    def automation_type_options
      AUTOMATION_TYPES.values.map do |item|
        [item[:label], item[:key]]
      end
    end

    def embedded_automate_key
      AUTOMATION_TYPES[:automate][:key]
    end

    def embedded_workflow_key
      AUTOMATION_TYPES[:workflow][:key]
    end

    # Returns true if the field holds value 'embedded_automate'
    def embedded_automate(field)
      field == embedded_automate_key
    end

    # Returns true if the field holds value 'embedded_workflow'
    def embedded_workflow(field)
      field == embedded_workflow_key
    end

    # Returns the default automation type 'embedded_automate'
    def default_entry_point_type
      embedded_automate_key
    end

    # Method to return the field identifier for type and configuration_script_id
    def entry_point_fields(field)
      key_prefix = ENTRY_POINT_TYPES[field][:type]
      {
        :type                    => "#{key_prefix}_entry_point_type".to_sym,
        :configuration_script_id => "#{key_prefix}_configuration_script_id".to_sym,
        :previous                => "#{field}_previous".to_sym,
      }
    end

    # Method to return the data needed for entry_point selector in service-catalog form.
    # Used in _provision_entry_points, _retirement_entry_points, _reconfigure_entry_points view files.
    def entry_point_data(edit, key)
      edit_new = edit[:new]
      fields = entry_point_fields(key)
      type = edit_new[fields[:type]] # 'embedded_automate' || 'embedded_workflow'
      configuration_script_id = fields[:configuration_script_id]
      return edit, edit_new, type, configuration_script_id
    end

    # Method to return the url for entry_point onchange event.
    def form_field_change_url(edit)
      action = edit[:new][:service_type] == "composite" ? "st_form_field_changed" : "atomic_form_field_changed"
      url_for(:id => (edit[:rec_id] || "new").to_s, :action => action, :form_field_changed => true)
    end

    # Method to return the modal-box open and close event actions.
    # automation_type => 'embedded_automate' || 'embedded_workflow'
    # field           => :fqname || :retire_fqname || :reconfigure_fqname
    # type            => 'provision' || 'retire' || 'configure'
    def entry_point_modal_events(automation_type, field)
      type = ENTRY_POINT_TYPES[field][:type]
      on_open = "miqShowAE_Tree('#{type}'); miqButtons('hide', 'automate');" # default
      if embedded_workflow(automation_type)
        configuration_script_id_key = entry_point_fields(field)[:configuration_script_id]
        on_open = "miqShowEmbededdedWorkflowsModal('#{field}', '#{configuration_script_id_key}', '#{type}'); miqButtons('hide', 'automate');"
      end

      {
        :open  => on_open,
        :close => "miqAjax('#{url_for_only_path(:action => 'ae_tree_select_discard', :typ => type)}');"
      }
    end
  end
end
