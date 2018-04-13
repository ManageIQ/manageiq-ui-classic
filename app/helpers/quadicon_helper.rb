module QuadiconHelper
  QUADRANTS = %i(top_left top_right bottom_left bottom_right middle).freeze

  def self.status_img(status)
    case status
    when "Invalid" then "100/x.png"
    when "Valid"   then "100/checkmark.png"
    when "None"    then "100/unknown.png"
    else                "100/exclamationpoint.png"
    end
  end

  def self.compliance_img(status)
    case status
    when true  then '100/check.png'
    when 'N/A' then '100/na.png'
    else            '100/x.png'
    end
  end

  def self.quadicon_output(quadicon)
    if (quadicon.keys & QUADRANTS).any?
      QUADRANTS.each do |part|
        quadicon[part] = quadrant_output(quadicon[part])
      end
    else
      quadicon = quadrant_output(quadicon)
    end

    quadicon
  end

  def self.settings_key(klass, layout)
    if klass.base_model.to_s.underscore == "ext_management_system"
      case layout
      when "ems_infra"
        :ems
      when "ems_physical_infra", "ems_cloud", "ems_network", "ems_container"
        layout.to_sym
      end
    else
      klass.base_model.name.underscore.to_sym
    end
  end

  # Change the bottom-right quadrant of the quadicon with the policy simulation result
  def self.policy_sim(quad, result)
    if quad.try(:[], :bottom_right)
      img = case result
            when true  then '100/check.png'
            when 'N/A' then '100/na.png'
            else            '100/x.png'
            end

      quad[:bottom_right] = {
        :fileicon => img,
        :tooltip  => result
      }
    end
    quad
  end

  def self.quadrant_output(quadrant)
    # Call asset_path on the fileicon value
    quadrant[:fileicon] = ActionController::Base.helpers.image_path(quadrant[:fileicon]) if quadrant.try(:[], :fileicon)
    # Convert all numbers to string
    quadrant[:text] = quadrant[:text].to_s if quadrant.try(:[], :text).kind_of?(Numeric)

    quadrant
  end

  def quadicon_hash(item)
    # Quadicons should be displayed when explicitly set or when the user is on the policy simulation screen
    quad_method = if settings(:quadicons, QuadiconHelper.settings_key(item.class, @layout)) || !!@policy_sim
                    :quadicon
                  else
                    :single_quad
                  end
    quad_icon = item.try(:decorate).try(quad_method)
    # Fall back to a single quad if a quadicon is not available
    quad_icon = item.try(:decorate).try(:single_quad) if quad_icon.nil? && quad_method == :quadicon

    # Alter the quadicon's bottom-right quadrant on the policy simulation screen
    if !!@policy_sim && session[:policies].present?
      quad_icon = QuadiconHelper.policy_sim(quad_icon, item.passes_profiles?(session[:policies].keys))
    end

    QuadiconHelper.quadicon_output(quad_icon) if quad_icon
  end
end
