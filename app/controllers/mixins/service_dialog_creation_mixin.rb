module ServiceDialogCreationMixin
  extend ActiveSupport::Concern

  private

  def dialog_creation_form_field_changed(id)
    return unless load_edit(id)
    @edit[:new][:dialog_name] = params[:dialog_name] if params[:dialog_name]
    render :update do |page|
      page << javascript_prologue
      page << javascript_hide("buttons_off")
      page << javascript_show("buttons_on")
      page << "miqSparkle(false);"
    end
  end
end
