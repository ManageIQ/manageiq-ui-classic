class MiqAeMethodDecorator < MiqDecorator
  def fileicon
    "svg/vendor-ansible.svg" if location == 'playbook'
  end

  def fonticon
    case location
    when "inline"
      'fa-ruby'
    when "expression"
      'fa fa-search'
    when "playbook"
      nil
    else
      'ff ff-method'
    end
  end
end
