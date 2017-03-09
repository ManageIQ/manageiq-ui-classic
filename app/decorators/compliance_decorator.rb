class ComplianceDecorator < MiqDecorator
  def fonticon
    "pficon #{compliant ? 'pficon-ok' : 'pficon-error-circle-o'}"
  end
end
