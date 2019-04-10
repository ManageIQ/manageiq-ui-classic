module OpsController::Settings::HelpMenu
  extend ActiveSupport::Concern

  def settings_update_help_menu
    return unless load_edit('customize_help_menu')

    begin
      konfig = Vmdb::Settings.decrypt_passwords!(Settings.to_hash)
      konfig[:help_menu].merge!(@edit[:new])
      success, config_errors = Vmdb::Settings.validate(konfig)
    rescue Psych::SyntaxError, StandardError
      add_flash(_('Invalid configuration parameters.'), :error)
      success = false
    end

    success = config_errors.blank? if success.nil?

    if success
      MiqServer.my_server.add_settings_for_resource(konfig)
      session.delete(:edit)
      add_flash(_('Help menu customization changes successfully stored.'), :success)
    else
      add_flash(_('Storing the custom help menu configuration was not successful.'), :error)
    end

    session[:changed] = !success

    render :update do |page|
      page << javascript_prologue
      page << javascript_for_miq_button_visibility(!success)
      page.replace(:flash_msg_div, :partial => "layouts/flash_msg")
    end
  end

  def help_menu_form_field_changed
    return unless load_edit('customize_help_menu')

    help_menu_items.each do |item|
      %i[title href type].map do |field|
        param = params["#{item}_#{field}"]
        next if param.nil?

        @edit[:new][item][field] = param
        @edit[:new][item].delete(field) if param.empty?
      end
    end

    changed = @edit[:new] != @edit[:current]
    session[:changed] = changed

    render :update do |page|
      page << javascript_prologue
      page << javascript_for_miq_button_visibility(changed)
    end
  end
end
