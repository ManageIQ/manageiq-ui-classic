class MiqRequestDecorator < MiqDecorator
  def fonticon
    case request_status.to_s.downcase
    when "ok"
      "pficon pficon-ok"
    when "error"
      "pficon pficon-error-circle-o"
    end
  end

  def listicon_image
    case request_status.to_s.downcase
    when "ok"
      "100/checkmark.png"
    when "error"
      "100/x.png"
    # else - handled in application controller
    #  "100/#{@listicon.downcase}.png"
    end
  end
end
