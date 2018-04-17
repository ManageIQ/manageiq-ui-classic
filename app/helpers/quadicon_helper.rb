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

  def self.machine_state(state_str)
    case state_str.try(:downcase)
    when 'archived'
      {:text => 'A', :background => '#336699'}
    when 'orphaned'
      {:text => 'O', :background => '#336699'}
    when 'retired'
      {:text => 'R', :background => '#336699'}
    when 'unknown'
      {:fonticon => 'pficon pficon-unknown', :background => '#336699'}
    when 'preparing_for_maintenance'
      {:fonticon => 'pficon pficon-maintenance', :background => '#336699'}
    when 'maintenance'
      {:fonticon => 'pficon pficon-maintenance', :background => '#336699'}
    when 'disconnected'
      {:fonticon => 'pficon pficon-unplugged', :background => '#336699'}
    when 'non_operational'
      {:fonticon => 'fa fa-exclamation', :background => '#336699'}
    when 'not_responding'
      {:fonticon => 'fa fa-exclamation', :background => '#336699'}
    when 'install_failed'
      {:fonticon => 'fa fa-exclamation', :background => '#336699'}
    when 'suspended'
      {:fonticon => 'pficon pficon-asleep', :background => '#FF9900'}
    when 'standby'
      {:fonticon => 'pficon pficon-asleep', :background => '#FF9900'}
    when 'paused'
      {:fonticon => 'pficon pficon-asleep', :background => '#FF9900'}
    when 'disconnecting'
      {:fonticon => 'pficon pficon-unplugged', :background => '#FF9900'}
    when 'image_locked'
      {:fonticon => 'pficon pficon-locked', :background => '#FF9900'}
    when 'migrating'
      {:fonticon => 'pficon pficon-migration', :background => '#FF9900'}
    when 'shelved'
      {:fonticon => 'pficon pficon-pending', :background => '#FF9900'}
    when 'shelved_offloaded'
      {:fonticon => 'pficon pficon-pending', :background => '#FF9900'}
    when 'reboot_in_progress'
      {:fonticon => 'pficon pficon-on', :background => '#FF9900'}
    when 'wait_for_launch'
      {:fonticon => 'pficon pficon-asleep', :background => '#FF9900'}
    when 'on'
      {:fonticon => 'pficon pficon-on', :background => '#3F9C35'}
    when 'never'
      {:fonticon => 'pficon pficon-off', :background => '#CC0000'}
    when 'terminated'
      {:fonticon => 'pficon pficon-off', :background => '#CC0000'}
    when 'off'
      {:fonticon => 'pficon pficon-off', :background => '#CC0000'}
    else
      {}
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
