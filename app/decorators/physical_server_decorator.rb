class PhysicalServerDecorator < MiqDecorator
  def img_for_physical_vendor
    "svg/vendor-#{label_for_vendor.downcase}.svg"
  end

  def img_for_health_state
    case health_state
    when "Valid"    then "svg/healthstate-normal.svg"
    when "Critical" then "svg/healthstate-critical.svg"
    when "None"     then "svg/healthstate-unknown.svg"
    when "Warning"  then "100/warning.png"
    end
  end
end
