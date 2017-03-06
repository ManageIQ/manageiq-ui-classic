class MiqPolicySetDecorator < MiqDecorator
  def fonticon
    active? ? 'fa fa-shield' : 'fa fa-inactive fa-shield'
  end
end
