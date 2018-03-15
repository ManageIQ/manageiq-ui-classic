module QuadiconHelper::Decorator
  class << self
    QUADRANTS = %i(top_left top_right bottom_left bottom_right middle).freeze

    def status_img(status)
      case status
      when "Invalid" then "100/x.png"
      when "Valid"   then "100/checkmark.png"
      when "None"    then "100/unknown.png"
      else                "100/exclamationpoint.png"
      end
    end

    def compliance_img(status)
      case status
      when true  then '100/check.png'
      when 'N/A' then '100/na.png'
      else            '100/x.png'
      end
    end

    def quadicon_output(quadicon)
      if (quadicon.keys & QUADRANTS).any?
        QUADRANTS.each do |part|
          quadicon[part] = quadrant_output(quadicon[part])
        end
      else
        quadicon = quadrant_output(quadicon)
      end

      quadicon
    end

    def settings_key(klass, layout)
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

    def policy_sim(quad, result)
      # Change the bottom-right quadrant of the quadicon with the policy simulation result
      if quad.try(:[], :bottom_right)
        quad[:bottom_right] = {
          :fileicon => compliance_img(result),
          :tooltip  => result
        }
      end
      quad
    end

    private

    def quadrant_output(quadrant)
      # Call asset_path on the fileicon value
      quadrant[:fileicon] = ActionController::Base.helpers.image_path(quadrant[:fileicon]) if quadrant.try(:[], :fileicon)
      # Convert all numbers to string
      quadrant[:text] = quadrant[:text].to_s if quadrant.try(:[], :text).kind_of?(Numeric)

      quadrant
    end
  end
end
