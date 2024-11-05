module OpsController::Settings::HelpMenu
  extend ActiveSupport::Concern

  def settings_update_help_menu
    assert_privileges("region_edit")

    help_menu_form_get_vars

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
    end

    session[:changed] = !success
  end

  def help_menu_form_get_vars
    assert_privileges("region_edit")

    return unless load_edit('customize_help_menu')

    Menu::DefaultMenu.help_menu_items.each do |item|
      id = item.id.to_sym
      %i[title href type].map do |field|
        param = params["#{id}_#{field}"]

        @edit[:new][id][field] = param
      end
    end
    changed = @edit[:new] != @edit[:current]
    session[:changed] = changed
  end
end
