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
      :bottom_right => QuadiconHelper.health_state(health_state)
    }
  end

  def single_quad
    {
      :fonticon => fonticon,
      :tooltip  => ui_lookup(:model => type),
    }
  end
end
