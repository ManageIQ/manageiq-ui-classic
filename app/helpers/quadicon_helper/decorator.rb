module QuadiconHelper::Decorator
  class << self
    def status_img(status)
      case status
      when "Invalid" then "100/x.png"
      when "Valid"   then "100/checkmark.png"
      when "None"    then "100/unknown.png"
      else                "100/exclamationpoint.png"
      end
    end

    def compliance_img(status)
      case status
      when true  then '100/check.png'
      when 'N/A' then '100/na.png'
      else            '100/x.png'
      end
    end
  end

  def quadicon_lastaction_is_policy_sim?
    @lastaction == "policy_sim"
  end

  def quadicon_policy_sim?
    !!@policy_sim
  end
end
