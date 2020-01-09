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
          else
            @redirect_controller = 'vm'
            @redirect_id = @record.id
          end
          rename_set_form_vars
          build_rename_screen
          @refresh_partial = 'rename_vm'
        end

        def build_rename_screen
          drop_breadcrumb(:name => _("Rename VM '%{name}''") % {:name => @record.name}, :url => '/vm/rename') unless @explorer
          session[:edit] = @edit
          @in_a_form = true
        end

        def name_changed
          return unless load_edit("vm_rename__#{params[:id]}")

          rename_get_form_vars
          @changed = changed = session[:changed] = @edit[:new] != @edit[:current]
          render :update do |page|
            page << javascript_prologue
            page << javascript_for_miq_button_visibility(changed)
            page << "miqSparkle(false);"
          end
        end

        # Set form variables for rename
        def rename_set_form_vars
          @edit = {}
          @edit[:vm_id] = @record.id
          @edit[:new] = {}
          @edit[:current] = {}
          @edit[:explorer] = true if params[:action] == 'x_button' || session.fetch_path(:edit, :explorer)
          @edit[:current][:name] = @edit[:new][:name] = @record.name
          @edit[:key] = "vm_rename__#{@record.id}"
          session[:edit] = @edit
        end

        # Get form variable for rename
        def rename_get_form_vars
          @record = VmOrTemplate.find_by(:id => @edit[:vm_id])
          @edit[:new][:name] = params[:name] if params[:name]
          session[:edit] = @edit
        end

        # Button actions for VM's renaming screen
        def rename_vm
          return unless load_edit("vm_rename__#{params[:id]}")

          @explorer = true if @edit[:explorer]
          rename_get_form_vars
          case params[:button]
          when 'cancel'
            rename_cancel
          when 'save'
            rename_save
          when 'reset'
            rename_reset
          else
            build_rename_screen
            if @edit[:explorer]
              replace_right_cell
            else
              render :action => 'rename'
            end
          end
        end

        def rename_finished
          task_id = session[:async][:params][:task_id]
          vm_name = session[:edit][:current][:name]
          task = MiqTask.find(task_id)
          if MiqTask.status_ok?(task.status)
            add_flash(_("Rename of Virtual Machine \"%{name}\" has been initiated") % { :name => vm_name })
          else
            add_flash(_("Unable to rename Virtual Machine \"%{name}\": %{details}") %
                      { :name => vm_name, :details => task.message }, :error)
          end
          session[:edit] = nil
          if @edit[:explorer]
            @sb[:action] = nil
            replace_right_cell
          else
            flash_to_session
            javascript_redirect(previous_breadcrumb_url)
          end
        end

        private

        def rename_cancel
          msg = _("Rename of VM \"%{name}\" was cancelled by the user") % {:name => @record.name}
          if @edit[:explorer]
            add_flash(msg)
            @record = @sb[:action] = nil
            replace_right_cell
          else
            flash_to_session(msg)
            javascript_redirect(previous_breadcrumb_url)
          end
        end

        def rename_save
          task_id = @record.rename_queue(session[:userid], @edit[:new][:name])
          if task_id.kind_of?(Integer)
            initiate_wait_for_task(:task_id => task_id, :action => 'rename_finished')
          else
            add_flash(
              :text        => _("VM rename: Task start failed"),
              :severity    => :error,
              :spinner_off => true
            )
          end
        end

        def rename_reset
          vm_rename
          add_flash(_('All changes have been reset'), :warning)
          if @edit[:explorer]
            @changed = session[:changed] = false
            replace_right_cell
          else
            flash_to_session
            javascript_redirect(:action => 'rename_vm', :controller => 'vm', :id => params[:id])
          end
        end
      end
    end
  end
end
