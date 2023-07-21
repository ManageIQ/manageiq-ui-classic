module Mixins
  module AutomationMixin
    # Returns an object to be reused for passing down to service catalogs(rails) and dialog(angular) form.
    # used in catalogs_helper, miq_ae_customization_helper, catalog_controller, editor.html.haml
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
    # used in provision_entry_points, retirement_entry_points, reconfigure_entry_points html files
    def automation_type_options
      options = [["<#{_('No Entry Point')}>", nil]]
      options + AUTOMATION_TYPES.values.map do |item|
        [item[:label], item[:key]]
      end
    end

    # Returns true if the field holds value 'embedded_automate'
    def embedded_automate(field)
      field == AUTOMATION_TYPES[:automate][:key]
    end

    # Returns true if the field holds value 'embedded_workflow'
    def embedded_workflow(field)
      field == AUTOMATION_TYPES[:workflow][:key]
    end

    # Returns the default automation type 'embedded_automate'
    def default_automation_type
      AUTOMATION_TYPES[:automate][:key]
    end
  end
end
