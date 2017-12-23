module Mixins
  module Actions
    module VmActions
      module Transform
        def vm_transform
          dialog = Dialog.find_by(:label => 'Transform VM')
          vm = Vm.find_by(:id => params[:id].to_i)
          @right_cell_text = _("Transform VM %{name} to RHV") % {:name => vm.name}
          dialog_initialize(
            dialog.resource_actions.first,
            :header     => @right_cell_text,
            :target_id  => vm.id,
            :target_kls => Vm.name
          )
        end
      end
    end
  end
end
