module TextualMixins::EmsCommon
  def textual_compliance_history
    super(:title    => _("Show Compliance History of this Provider (Last 10 Checks)"),
          :explorer => true)
  end
end
