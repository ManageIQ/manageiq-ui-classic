module QuadiconHelper
  QUADRANTS = %i(top_left top_right bottom_left bottom_right middle).freeze
  POLICY_SHIELD = {
    :fonticon => 'fa fa-shield',
    :color    => '#f5c12e',
    :tooltip  => _('This object has policies assigned.')
  }.freeze

  MACHINE_STATE_QUADRANT = {
    'archived'                  => {:fonticon => 'fa fa-archive', :background => '#336699'},
    'orphaned'                  => {:fonticon => 'ff ff-orphaned', :background => '#336699'},
    'retired'                   => {:fonticon => 'fa fa-clock-o', :background => '#336699'},
    'unknown'                   => {:fonticon => 'pficon pficon-unknown', :background => '#336699'},
    'preparing_for_maintenance' => {:fonticon => 'pficon pficon-maintenance', :background => '#336699'},
    'maintenance'               => {:fonticon => 'pficon pficon-maintenance', :background => '#336699'},
    'disconnected'              => {:fonticon => 'pficon pficon-unplugged', :background => '#336699'},
    'non_operational'           => {:fonticon => 'fa fa-exclamation', :background => '#336699'},
    'not_responding'            => {:fonticon => 'fa fa-exclamation', :background => '#336699'},
    'install_failed'            => {:fonticon => 'fa fa-exclamation', :background => '#336699'},
    'suspended'                 => {:fonticon => 'pficon pficon-asleep', :background => '#FF9900'},
    'standby'                   => {:fonticon => 'pficon pficon-asleep', :background => '#FF9900'},
    'paused'                    => {:fonticon => 'pficon pficon-asleep', :background => '#FF9900'},
    'disconnecting'             => {:fonticon => 'pficon pficon-unplugged', :background => '#FF9900'},
    'image_locked'              => {:fonticon => 'pficon pficon-locked', :background => '#FF9900'},
    'migrating'                 => {:fonticon => 'pficon pficon-migration', :background => '#FF9900'},
    'shelved'                   => {:fonticon => 'pficon pficon-pending', :background => '#FF9900'},
    'shelved_offloaded'         => {:fonticon => 'pficon pficon-pending', :background => '#FF9900'},
    'reboot_in_progress'        => {:fonticon => 'pficon pficon-on', :background => '#FF9900'},
    'wait_for_launch'           => {:fonticon => 'pficon pficon-asleep', :background => '#FF9900'},
    'on'                        => {:fonticon => 'pficon pficon-on', :background => '#3F9C35'},
    'never'                     => {:fonticon => 'pficon pficon-off', :background => '#CC0000'},
    'terminated'                => {:fonticon => 'pficon pficon-off', :background => '#CC0000'},
    'off'                       => {:fonticon => 'pficon pficon-off', :background => '#CC0000'},
    'template'                  => {:fonticon => 'pficon pficon-template', :background => '#336699'},
    'powering_up'               => {:fonticon => 'pficon pficon-on', :background => '#FF9900'},
    'powering_down'             => {:fonticon => 'pficon pficon-off', :background => '#FF9900'},
  }.freeze

  def self.provider_status(status, enabled = true)
    # If the provider is suspended, we don't care about the status itself
    unless enabled
      return {
        :fonticon => 'pficon pficon-asleep',
        :tooltip  => _('Data collection for this provider is suspended.')
      }
    end

    case status
    when "Invalid"
      {:fonticon => 'pficon pficon-error-circle-o', :tooltip => _('Invalid authentication credentials')}
    when "Valid"
      {:fonticon => 'pficon pficon-ok', :tooltip => _('Authentication credentials are valid')}
    when "None"
      {:fonticon => 'pficon pficon-unknown', :tooltip => _('Could not determine the authentication status')}
    else
      {:fonticon => 'fa fa-exclamation', :tooltip => _('Authentication status is %{status}') % {:status => status} }
    end
  end

  def self.health_state(status)
    case status
    when "Valid"
      {:fonticon => "pficon pficon-ok", :tooltip => _('Normal health state')}
    when "Critical"
      {:fonticon => "fa fa-exclamation", :color => '#cc0000', :tooltip => _('Critical health state')}
    when "Warning"
      {:fonticon => "pficon pficon-warning-triangle-o", :tooltip => _('Health state warning')}
    else
      {:fonticon => "pficon pficon-unknown", :tooltip => _('Could not determine health state')}
    end
  end

  def self.os_icon(name)
    name == "unknown" ? { :fonticon => 'pficon pficon-unknown' } : {:fileicon => "svg/os-#{ERB::Util.h(name)}.svg" }
  end

  def self.machine_state(state_str)
    MACHINE_STATE_QUADRANT[state_str.try(:downcase)] || {}
  end

  # Change the bottom-right quadrant of the quadicon with the policy simulation result
  def policy_sim(quad, result)
    if quad.try(:[], :bottom_right)
      quad[:bottom_right] = case result
                            when true
                              {:fonticon => 'pficon pficon-ok', :tooltip => _('Policy simulation successful.')}
                            when 'N/A'
                              {:fonticon => 'fa fa-ban', :tooltip => _('Policy simulation not applicable.')}
                            else
                              {:fonticon => 'pficon-error-circle-o', :tooltip => _('Policy simulation failed with: %{error}') % {:error => result}}
                            end
    end
    quad
  end

  def quadrant_output(quadrant)
    # Call asset_path on the fileicon value
    quadrant[:fileicon] = ActionController::Base.helpers.image_path(quadrant[:fileicon]) if quadrant.try(:[], :fileicon)
    # Convert all numbers to string
    quadrant[:text] = quadrant[:text].to_s if quadrant.try(:[], :text).kind_of?(Numeric)

    quadrant
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

  def quadicon_hash(item)
    settings_key = item.class.try(:decorate).try(:to_s).try(:chomp, 'Decorator').try(:demodulize).try(:underscore).try(:to_sym)
    # Quadicons should be displayed when explicitly set or when the user is on the policy simulation screen
    quad_method = if settings(:quadicons, settings_key) || !!@policy_sim
                    :quadicon
                  else
                    :single_quad
                  end
    quad_icon = item.try(:decorate).try(quad_method)
    # Fall back to a single quad if a quadicon is not available
    quad_icon = item.try(:decorate).try(:single_quad) if quad_icon.nil? && quad_method == :quadicon

    # Alter the quadicon's bottom-right quadrant on the policy simulation screen
    if !!@policy_sim && session[:policies].present?
      quad_icon = policy_sim(quad_icon, item.passes_profiles?(session[:policies].keys))
    end

    quadicon_output(quad_icon) if quad_icon
  end
end
