module Mixins
  module Actions
    module ProviderActions
      module MassTransform
        def vm_transform_mass
          dialog = Dialog.find_by!(:label => 'Transform VM')
          @right_cell_text = _("Transform VMs to RHV")
          if params.key?(:id)
            provider = ExtManagementSystem.find_by!(:id => params[:id].to_i)
            dialog_initialize(
              dialog.resource_actions.first,
              :header     => @right_cell_text,
              :target_id  => provider.id,
              :target_kls => Provider.name
            )
          else
            provider = ExtManagementSystem.find_by!(:type => 'ManageIQ::Providers::Redhat::InfraManager')
            simple_dialog_initialize(
              dialog.resource_actions.first,
              :header => @right_cell_text,
              :target => provider
            )
          end
        end

        private

        def simple_dialog_initialize(ra, options)
          @record = Dialog.find_by(:id => ra.dialog_id.to_i)
          new = options[:dialog] || {}
          id = @record.try(:id)
          opts = {
            :target => options[:target]
          }
          @edit = {
            :new             => new,
            :wf              => ResourceActionWorkflow.new(new, current_user, ra, opts),
            :rec_id          => id,
            :key             => "dialog_edit__#{id || "new"}",
            :explorer        => @explorer || false,
            :dialog_mode     => options[:dialog_mode],
            :current         => copy_hash(new),
            :right_cell_text => options[:header].to_s
          }
          @in_a_form = true
          @changed = session[:changed] = true
          if @edit[:explorer]
            replace_right_cell(:action => "dialog_provision")
          else
            javascript_redirect(:action => 'dialog_load')
          end
        end
      end
    end
  end
end
