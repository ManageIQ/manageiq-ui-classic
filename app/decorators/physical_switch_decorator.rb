class PhysicalSwitchDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-container-node'
  end

  private

  def health_state_img
    case health_state
    when "Valid"    then "svg/healthstate-normal.svg"
    when "Critical" then "svg/healthstate-critical.svg"
    when "Warning"  then "100/warning.png"
    else "svg/healthstate-unknown.svg"
    end
  end
end
