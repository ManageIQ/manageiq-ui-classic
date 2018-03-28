module QuadiconHelper
  def quadicon_hash(item)
    # Quadicons should be displayed when explicitly set or when the user is on the policy simulation screen
    quad_method = if settings(:quadicons, QuadiconHelper::Decorator.settings_key(item.class, @layout)) || !!@policy_sim
                    :quadicon
                  else
                    :single_quad
                  end

    quad_icon = item.try(:decorate).try(quad_method)
    # Fall back to a single quad if a quadicon is not available
    quad_icon = item.try(:decorate).try(:single_quad) if quad_icon.nil? && quad_method == :quadicon

    # Alter the quadicon's bottom-right quadrant on the policy simulation screen
    if !!@policy_sim && session[:policies].present?
      quad_icon = QuadiconHelper::Decorator.policy_sim(quad_icon, item.passes_profiles?(session[:policies].keys))
    end

    QuadiconHelper::Decorator.quadicon_output(quad_icon) if quad_icon
  end
end
