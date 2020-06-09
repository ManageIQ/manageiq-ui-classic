module ApplicationHelper
  module FormTags
    # override: default password_field_tag doesn't switch off autocomplete
    def password_field_tag(name, value = nil, options = {})
      options = {
        :type => 'password',
        :autocomplete => 'off',
      }.merge(options)

     text_field_tag(name, value, options)
    end

    def datepicker_input_tag(name, value = nil, options = {})
      datepicker_options = {
        "data-provide"         => "datepicker",
        "data-date-autoclose"  => "true",
        "data-date-format"     => "mm/dd/yyyy",
        "data-date-language"   => FastGettext.locale,
        "data-date-week-start" => 0
      }
      text_field_tag(name, value, options.merge!(datepicker_options))
    end

    def datetimepicker_input_tag(name, value = nil, options = {})
      datepicker_options = {
        "datetimepicker"  => true,
        # FIXME: currently, not all locales (e.g. Japanese) are supported
        # by the datepicker widget and would throw an ugly javascript error
        # "datetime-locale" => FastGettext.locale,
        # FIXME: in the future, this should honor l10n preferences. Here we need
        # to supply a format that moment.js understands.
        "datetime-format" => 'MM/DD/YYYY HH:mm'
      }
      text_field_tag(name, value, options.merge!(datepicker_options))
    end
  end
end
