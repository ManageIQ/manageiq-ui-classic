class ComplianceDetailDecorator < MiqDecorator
  def fonticon
    "pficon #{miq_policy_result ? 'pficon-ok' : 'pficon-error-circle-o'}"
  end
end
