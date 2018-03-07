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
  end

  def health_state_img(item = nil)
    case item.health_state
    when "Valid"    then "svg/healthstate-normal.svg"
    when "Critical" then "svg/healthstate-critical.svg"
    when "Warning"  then "100/warning.png"
    else "svg/healthstate-unknown.svg"
    end
  end

  def compliance_img(item, policies = {})
    case item.passes_profiles?(policies)
    when true  then '100/check.png'
    when 'N/A' then '100/na.png'
    else            '100/x.png'
    end
  end

  def quadicon_lastaction_is_policy_sim?
    @lastaction == "policy_sim"
  end

  def quadicon_policy_sim?
    !!@policy_sim
  end
end
