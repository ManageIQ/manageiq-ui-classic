module JsHelper
  def set_element_visible(element, status)
    status ? javascript_show_if_exists(element) : javascript_hide_if_exists(element)
  end

  # replacement for app/views/shared/ajax/_spinner_control.js.erb
  # Turn spinner off
  def set_spinner_off
    'miqSparkleOff();'
  end

  def javascript_focus(element)
    "$('##{j(element)}').focus();".html_safe
  end

  def javascript_disable_field(element)
    "$('##{j(element)}').prop('disabled', true);".html_safe
  end

  def javascript_enable_field(element)
    "$('##{j(element)}').prop('disabled', false);".html_safe
  end

  def javascript_show(element)
    "$('##{j(element)}').show();".html_safe
  end

  def javascript_hide(element)
    "$('##{j(element)}').hide();".html_safe
  end

  def javascript_show_if_exists(element)
    "if (miqDomElementExists('#{j(element)}')) #{javascript_show(element)}".html_safe
  end

  def javascript_hide_if_exists(element)
    "if (miqDomElementExists('#{j(element)}')) #{javascript_hide(element)}".html_safe
  end

  def javascript_checked(element)
    "if ($('##{j(element)}').prop('type') == 'checkbox') {$('##{j(element)}').prop('checked', true);}".html_safe
  end

  def javascript_unchecked(element)
    "if ($('##{j(element)}').prop('type') == 'checkbox') {$('##{j(element)}').prop('checked', false);}".html_safe
  end

  def js_build_calendar(options = {})
    skip_days = options[:skip_days].nil? ? 'undefined' : options[:skip_days].to_a.to_json

    <<~EOD
      ManageIQ.calendar.calDateFrom = #{js_format_date(options[:date_from])};
      ManageIQ.calendar.calDateTo = #{js_format_date(options[:date_to])};
      ManageIQ.calendar.calSkipDays = #{skip_days};
      miqBuildCalendar();
    EOD
  end

  # JSONP request access prevention
  def javascript_prologue
    'throw "error";'
  end

  def js_format_date(value)
    value.nil? ? 'undefined' : "new Date('#{value.iso8601}')"
  end
end
