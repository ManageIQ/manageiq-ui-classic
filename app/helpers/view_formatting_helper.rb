module ViewFormattingHelper
  def format_form_group(label, value = nil)
    output = content_tag(:label, :class => "col-md-2 control-label") do
      _(label)
    end
    output << content_tag(:div, :class => "col-md-8") do
      content_tag(:p, :class => "form-control-static") do
        value
      end
    end
    output
  end
end
