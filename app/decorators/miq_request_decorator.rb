class MiqRequestDecorator < MiqDecorator
  def fonticon
    case request_status.to_s.downcase
    when "ok"
      "pficon pficon-ok"
    when "error"
      "pficon pficon-error-circle-o"
    end
  end
end
