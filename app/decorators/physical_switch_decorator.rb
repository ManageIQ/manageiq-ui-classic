class PhysicalSwitchDecorator < MiqDecorator
  def self.fonticon
    'ff ff-network-switch'
  end

  def quadicon
    {
      :top_left     => {
        :text    => physical_network_ports.try(:size).to_i,
        :tooltip => _('Ports')
      },
      :top_right    => {
        :tooltip => power_state.try(:downcase),
      }.merge(QuadiconHelper.machine_state(power_state)),
      :bottom_left  => {
        :fonticon => fonticon,
        :tooltip  => ui_lookup(:model => type),
      },
      :bottom_right => {
        :fileicon => health_state_img,
        :tooltip  => _(health_state),
      }
    }
  end

  def single_quad
    {
      :fonticon => fonticon,
      :tooltip  => ui_lookup(:model => type),
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
