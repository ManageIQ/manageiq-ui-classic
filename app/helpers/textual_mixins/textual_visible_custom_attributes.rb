module TextualMixins::TextualVisibleCustomAttributes
  def redact_username_and_password(value)
    uri = URI.parse(value)
    uri.password = '***' if uri.password
    uri.user = '***' if uri.user
    uri.to_s
  rescue # dont reduct in case the value was malformed, to allow debugging it.
    value
  end

  def textual_miq_custom_attributes
    attrs = @record.miq_custom_visible
    return nil if attrs.blank?
    attrs.sort_by(&:name).collect do |a|
      {
        :label => a.name.tr("_", " "),
        :value => redact_username_and_password(a.value)
      }
    end
  end
end
