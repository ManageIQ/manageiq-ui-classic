# Setting Accordion methods included in OpsController.rb
module OpsController::Settings
  extend ActiveSupport::Concern
  include AnalysisProfiles
  include CapAndU
  include Common
  include Schedules
  include AutomateSchedules
  include Tags
  include LabelTagMapping
  include Upload
  include Zones
  include HelpMenu

  # Apply the good records from an uploaded import file
  def apply_imports
    assert_privileges("ops_settings")

    if session[:imports]
      begin
        session[:imports].apply
      rescue => bang
        add_flash(_("Error during 'apply': %{error}") % {:error => bang}, :error)
        @sb[:show_button] = true
      else
        add_flash(_("Records were successfully imported"))
        @sb[:show_button] = false
        session[:imports] = @sb[:imports] = nil
      end
    else
      add_flash(_("Use the Choose file button to locate CSV file"), :error)
      @sb[:show_button] = true
    end
    flash_to_session
    redirect_to(:action => 'explorer', :no_refresh => true)
  end

  def region_edit
    assert_privileges("region_edit")

    settings_set_view_vars
    @edit = {}
    replace_right_cell(:nodetype => "root")
  end

  private ############################

  def set_verify_status
    @edit[:default_verify_status] = (@edit[:new][:password] == @edit[:new][:verify])
  end
end
