class ApplicationController
  module UserScriptFile
    def upload_user_script
      @_params.delete(:commit)
      @upload_user_script = true
      @edit = session[:edit]
      build_grid

      if params.fetch_path(:upload, :file).respond_to?(:read)
        @edit[:new][:user_script] = params[:upload][:file].original_filename
        begin
          @edit[:new][:user_script_text] = params[:upload][:file].read
          msg = _('User script "%{params}" upload was successful') % {:params => params[:upload][:file].original_filename}
          add_flash(msg)
        rescue StandardError => bang
          @edit[:new][:user_script] = nil
          msg = _("Error during User Script \"%{params}\" file upload: %{message}") % {:params => params[:upload][:file].original_filename, :message => bang.message}
          add_flash(msg, :error)
        end
      end
    end

    def clear_user_script
      @_params.delete(:commit)
      @upload_user_script = true
      @edit = session[:edit]
      build_grid

      @edit[:new][:user_script_text] = nil
    end
  end
end
