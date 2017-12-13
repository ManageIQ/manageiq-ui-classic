class MiqTemplateDecorator < MiqDecorator
  def self.fonticon
    'ff ff-template'
  end

  def fileicon
    "svg/vendor-#{vendor.downcase}.svg"
  end

  def quadicon(settings = {})
    {
      :top_left     => {
        :fileicon => os_image,
        :tooltip  => os_image_name.humanize.downcase
      },
      :top_right    => {
        :state_icon => normalized_state.downcase,
        :tooltip    => normalized_state
      },
      :bottom_left  => {
        :fileicon => fileicon,
        :tooltip  => type
      },
      :bottom_right => settings[:show_compliance] ? compliance_image(settings[:policies]) : total_snapshots
    }
  end

  private

  def os_image
    "svg/os-#{ERB::Util.h(os_image_name.downcase)}.svg"
  end
end
