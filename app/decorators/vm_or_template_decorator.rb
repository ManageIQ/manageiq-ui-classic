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

  def quadicon(settings = {})
    show_compliance = settings[:show_compliance] && settings[:policies].present?
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
      :bottom_right => show_compliance ? compliance_image(settings[:policies].keys) : {:text => ERB::Util.h(v_total_snapshots)}
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

  # FIXME: this will be unnecessary after the conditional policies are dropped from the decorators
  def compliance_image(policies)
    {
      :fileicon => QuadiconHelper::Decorator.compliance_img(passes_profiles?(policies)),
      :tooltip  => passes_profiles?(get_policies)
    }
  end
end
