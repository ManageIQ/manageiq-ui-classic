describe AuthKeyPairCloudHelper::TextualSummary do
  include_examples "textual_group", "Relationships", %i[vms]
  include_examples "textual_group", "Properties", %i[name fingerprint]
end
