class MiqPolicyDecorator < MiqDecorator
  def fonticon
    icon = towhat.safe_constantize.try(:decorate).try(:fonticon)
    "#{icon}#{active ? '' : ' fa-inactive'}"
  end
end
