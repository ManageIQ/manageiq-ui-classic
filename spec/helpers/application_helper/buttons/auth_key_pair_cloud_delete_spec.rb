describe ApplicationHelper::Button::AuthKeyPairCloudDelete do
  describe '#disabled?' do
    it "when a private key is deletable, then the button is not disabled" do
      view_context = setup_view_context_with_sandbox({})
      button = described_class.new(
        view_context, {}, {"record" => object_double(ManageIQ::Providers::Amazon::CloudManager::AuthKeyPair.new, :auth_key => "present")}, {}
      )
      expect(button.disabled?).to be false
    end

    it "when a private key is not deletable then the button is disabled" do
      view_context = setup_view_context_with_sandbox({})
      button = described_class.new(
        view_context, {}, {"record" => object_double(ManageIQ::Providers::Amazon::CloudManager::AuthKeyPair.new, :auth_key => "")}, {}
      )
      expect(button.disabled?).to be true
    end
  end
end
