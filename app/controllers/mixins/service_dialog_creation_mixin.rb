module ServiceDialogCreationMixin
  extend ActiveSupport::Concern

  private

  def dialog_creation_form_field_changed(id)
    return unless load_edit(id)

    copy_params_if_set(@edit[:new], params, %i[name description dialog_name manager_id])
    @edit[:new][:draft] = params[:draft] == "true" if params[:draft]
    render :update do |page|
      page << javascript_prologue
      page << javascript_hide("buttons_off")
      page << javascript_show("buttons_on")
      page << "miqSparkle(false);"
    end
  end
end
