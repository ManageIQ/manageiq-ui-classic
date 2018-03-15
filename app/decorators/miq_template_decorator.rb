class MiqTemplateDecorator < MiqDecorator
  def self.fonticon
    'ff ff-template'
  end

  def fileicon
    "svg/vendor-#{vendor.downcase}.svg"
  end

  def quadicon
    {
      :top_left     => {
        :fileicon => os_image,
        :tooltip  => os_image_name.humanize.downcase
      },
      :top_right    => {
        :fileicon   => "svg/currentstate-#{ERB::Util.h(normalized_state.downcase)}.svg",
        :tooltip    => normalized_state
      },
      :bottom_left  => {
        :fileicon => fileicon,
        :tooltip  => type
      },
      :bottom_right => {
        :text => ERB::Util.h(v_total_snapshots)
      }
    }
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
