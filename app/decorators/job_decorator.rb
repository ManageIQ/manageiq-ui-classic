class JobDecorator < MiqDecorator
  def fonticon
    if state.downcase == "finished" && status
      cancel_msg = message.include?('cancel')
      if status.downcase == "ok" && !cancel_msg
        "pficon pficon-ok"
      elsif status.downcase == "error" || cancel_msg
        "pficon pficon-error-circle-o"
      elsif status.downcase == "warn" || cancel_msg
        "pficon pficon-warning-triangle-o"
      end
    elsif %w(queued waiting_to_start).include?(state.downcase)
      "fa fa-step-forward"
    elsif !%w(finished queued waiting_to_start).include?(state.downcase)
      "pficon pficon-running"
    end
  end
end
