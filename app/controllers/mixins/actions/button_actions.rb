module Mixins
  module Actions
    module ButtonActions
      def generic_action(action_method)
        # leave and show flash message, if the user has canceled the action
        if params[:button] == "cancel"
          add_flash(_("Action was cancelled by the user"))
          if @sb[:explorer]
            @sb[:action] = nil
            replace_right_cell
          else
            session[:flash_msgs] = @flash_array
            javascript_redirect previous_breadcrumb_url
          end
        end
        # make sure user has rights to work with selected objects
        assert_privileges(params[:pressed])
        record_class = get_rec_cls
        @records = find_records_with_rbac(record_class, checked_or_params)
        unless @records.present?
          javascript_flash(
            :text => _("At least one record must be selected"),
            :severity => :error,
            :scroll_top => true)
          return
        end
        # launch the action requested by the user
        if @explorer
          @sb[:explorer] = true
          send(action_method)
        else
          javascript_redirect(
            :controller => record_class.to_s, # maybe use get_class_from_controller_param
            :action => action_method,
            :escape => false)
        end
      end
    end
  end
end
