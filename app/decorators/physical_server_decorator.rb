class PhysicalServerDecorator < MiqDecorator
  def fileicon
    "svg/vendor-#{label_for_vendor.downcase}.svg"
  end

  def self.fonticon
    'pficon pficon-server'
  end

  def quadicon
    icon = {
      :top_left     => {:text => (host ? 1 : 0)},
      :top_right    => {
        :tooltip => power_state.try(:downcase)
      }.merge(QuadiconHelper.machine_state(power_state)),
      :bottom_left  => {
        :fileicon => fileicon,
        :tooltip  => type
      },
      :bottom_right => {
        :fileicon => health_state_img,
        :tooltip  => health_state
      }
    }
    icon[:middle] = { :fileicon => '100/shield.png' } if get_policies.present?
    icon
  end

  def single_quad
    {
      :fileicon => fileicon
    }
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
