class VmOrTemplateDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-virtual-machine'
  end

  def fonticon
    nil
  end

  def fileicon
    "svg/vendor-#{vendor.downcase}.svg"
  end

  def quadicon
    icon = {
      :top_left     => {
        :fileicon => os_image,
        :tooltip  => os_image_name.humanize.downcase
      },
      :top_right    => {
        :tooltip => normalized_state
      }.merge(QuadiconHelper.machine_state(normalized_state)),
      :bottom_left  => {
        :fileicon => fileicon,
        :tooltip  => type
      },
      :bottom_right => {
        :text => ERB::Util.h(v_total_snapshots)
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

  def os_image
    "svg/os-#{ERB::Util.h(os_image_name.downcase)}.svg"
  end
end
