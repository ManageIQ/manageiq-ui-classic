module ConfigurationHelper
  module ConfigurationViewHelper
    def render_view_buttons(resource, view)
      (case resource
       when :compare, :drift
         view == "compressed" ? compare_or_drift_compressed(resource) : compare_or_drift_expanded(resource)
       when :compare_mode, :drift_mode
         view == "details" ? compare_or_drift_mode_details(resource) : compare_or_drift_mode_exists(resource)
       when :summary_mode
         view == "dashboard" ? summary_mode_dashboard(resource) : summary_mode_textual(resource)
       end).html_safe
    end

    private

    def active_icon(image, text)
      content_tag(:li, :class => "active") do
        content_tag(:i, nil, :class => image, :title => text)
      end
    end

    def inactive_icon(image, text, resource, view)
      content_tag(:li) do
        link_to(content_tag(:i, nil, :class => image,
                                     :alt   => text),
                {:action   => "view_selected",
                 :resource => resource,
                 :view     => view},
                {:remote       => true,
                 'data-method' => :post,
                 :title        => text})
      end
    end

    def compare_or_drift_compressed(resource)
      inactive_icon("ff ff-view-expanded", _('Expanded View'), resource, "expanded") +
        active_icon("fa fa-bars fa-rotate-90", _('Compressed View'))
    end

    def compare_or_drift_expanded(resource)
      active_icon("ff ff-view-expanded", _('Expanded View')) +
        inactive_icon("fa fa-bars fa-rotate-90", _('Compressed View'), resource, "compressed")
    end

    def compare_or_drift_mode_exists(resource)
      inactive_icon("fa fa-bars fa-rotate-90", _('Details Mode'), resource, "details") +
        active_icon("ff ff-exists", _('Exists Mode'))
    end

    def compare_or_drift_mode_details(resource)
      active_icon("fa fa-bars fa-rotate-90", _('Details Mode')) +
        inactive_icon("ff ff-exists", _('Exists Mode'), resource, "exists")
    end

    def summary_mode_textual(resource)
      inactive_icon("fa fa-tachometer fa-1xplus", _('Dashboard View'), resource, "dashboard") +
        active_icon("fa fa-th-list", _('Textual View'))
    end

    def summary_mode_dashboard(resource)
      active_icon("fa fa-tachometer fa-1xplus", _('Dashboard View')) +
        inactive_icon("fa fa-th-list", _('Textual View'), resource, "textual")
    end

    def has_any_role?(arr)
      arr.any? { |r| role_allows?(:feature => r) }
    end
  end
end
