module ApplicationController::DialogRunner
  extend ActiveSupport::Concern

  # for non-explorer screen
  def dialog_load
    @edit = session[:edit]
    @record = Dialog.find(@edit[:rec_id])
    @in_a_form = true
    @showtype = "dialog_provision"
    @dialog_locals = params[:dialog_locals]
    render :template => "shared/dialogs/dialog_provision"
  end

  private

  def dialog_initialize(ra, options)
    @edit = {}
    @edit[:new] = options[:dialog] || {}

    @record = Dialog.find(ra.dialog_id.to_i)
    @edit[:rec_id] = @record.id
    @in_a_form = true
    @changed = session[:changed] = true
    if @explorer
      replace_right_cell(:action => "dialog_provision", :dialog_locals => options[:dialog_locals])
    else
      javascript_redirect(:action => 'dialog_load', :dialog_locals => options[:dialog_locals])
    end
  end
end
