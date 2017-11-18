module Mixins
  module Actions
    module VmActions
      module Transform
        def vm_transform
          dialog = Dialog.find_by(:label => 'Transform VM')
          if params.key?(:id)
            vm = Vm.find_by(:id => params[:id].to_i)
            @right_cell_text = _("Transform VM %{name} to RHV") % {:name => vm.name}
            dialog_initialize(
              dialog.resource_actions.first,
              :header     => @right_cell_text,
              :target_id  => vm.id,
              :target_kls => Vm.name
            )
          else
            @right_cell_text = _("Transform VMs to RHV")
            simple_dialog_initialize(
              dialog.resource_actions.first,
              :header => @right_cell_text
            )
          end
        end
      end
    end
  end
end
