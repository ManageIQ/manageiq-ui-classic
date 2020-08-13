module TextualMixins::TextualProtected
  def textual_protected
    protected = @record.has_policies
    {:label => _("Protected"), :icon => protected ? "fa fa-shield" : "fa fa-remove", :value => protected.to_s}
  end
end
