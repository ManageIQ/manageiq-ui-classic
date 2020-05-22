module OpsHelper
  include_concern 'TextualSummary'
  include_concern 'MyServer'
  include VmwareConsoleHelper

  def hide_button(button, opt)
    if opt == "on"
      button ? '' : 'display:none'
    else
      button ? 'display:none' : ''
    end
  end

  def selected_settings_tree?(tree_node)
    tree_keys = tree_node.split("-")
    # only 'root' key has 1 key after split
    if tree_keys.count == 2
      tree_keys.any? { |t_key| %w[msc sis z l ld lr].include?(t_key) }
    else
      false
    end
  end

  def selected?(tree_node, key)
    tree_node.split('-').first == key
  end

  def advanced_tab_warning
    if selected?(x_node, "svr")
      _('Caution: Manual changes to configuration files can disable the Server!') << " " <<
        _('Changes made to any individual settings will overwrite settings inherited from the Zone!')
    elsif selected?(x_node, "z")
      _('Caution: Manual changes to configuration files can disable the Zone!') << " " <<
        _('Changes made to any individual settings will overwrite settings inherited from the Region!')
    else
      _('Caution: Manual changes to configuration files can disable the Region!') << " " <<
        _('Changes made to any individual settings will overwrite settings inherited from the template!')
    end
  end

  def advanced_tab_info
    if selected?(x_node, "svr")
      _('To reset back to the Zone\'s setting or to delete a setting, set the value to <<reset>>.')
    elsif selected?(x_node, "z")
      _('To reset back to the Regions\'s setting or to delete a setting, set the value to <<reset>>.')
    else
      _('To reset back to the template\'s setting or to delete a setting, set the value to <<reset>>.')
    end
  end

  def auth_mode_name
    case ::Settings.authentication.mode.downcase
    when 'ldap'
      _('LDAP')
    when 'ldaps'
      _('LDAPS')
    when 'amazon'
      _('Amazon')
    when 'httpd'
      _('External Authentication')
    when 'database'
      _('Database')
    end
  end

  def server_zones
    @server_zones ||= Zone.visible.in_my_region.pluck(:name)
  end

  def server_zone_title_text
    _("The server zone cannot be changed when running in containers") if server_zones.length > 1 && !MiqServer.zone_is_modifiable?
  end
end
