module CustomButtonHelper
  def target_class_name(klass)
    case klass
    when 'MiqGroup'
      _('Group')
    when 'Switch'
      _('Virtual Infra Switch')
    when 'User'
      _('User')
    else
      ui_lookup(:model => klass)
    end
  end
end
