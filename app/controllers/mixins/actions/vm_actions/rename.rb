module Mixins
  module Actions
    module VmActions
      module Rename
        def vm_rename
          @record = find_record_with_rbac(VmOrTemplate, params[:miq_grid_checks] || params[:id])
          unless @record.supports?(:rename)
            add_flash(_("Renaming selected VM \"%{name}\" is not supported") % {:name => @record.name}, :error)
            if @explorer
              @record = @sb[:action] = nil
              replace_right_cell
            end
            return
          end
          if @explorer
            @changed = session[:changed] = false
          end
          @refresh_partial = 'rename_vm'
        end

        def build_rename_screen
          drop_breadcrumb(:name => _("Rename VM '%{name}'") % {:name => @record.name}, :url => '/vm/rename') unless @explorer
          session[:edit] = @edit
          @in_a_form = true
        end

        # Button actions for VM's renaming screen
        def rename_vm
          return unless load_edit("vm_rename__#{params[:id]}")
          @explorer = true if @edit[:explorer]
          build_rename_screen
          if @edit[:explorer]
            replace_right_cell
          end
        end

        private
      end
    end
  end
end
