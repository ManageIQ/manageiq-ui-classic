describe ApplicationHelper::Button::AuthKeyPairCloudCreate do
  let(:button) { described_class.new(setup_view_context_with_sandbox({}), {}, {}, {}) }

  def setup_ems(supports)
    ems = object_double(ManageIQ::Providers::CloudManager.new)
    allow(ems).to receive(:supports_auth_key_pair_create).and_return(supports)
    allow(Rbac).to receive(:filtered).and_return([ems])
  end

  describe '#disabled?' do
    it "when the create action is supported, then the button is not disabled" do
      setup_ems(true)
      expect(button.disabled?).to be false
    end

    it "when the create action is not supported, then the button is disabled" do
      setup_ems(false)
      expect(button.disabled?).to be true
    end
  end

  describe '#calculate_properties' do
    it "when the create action is not supported, then the button has the error in the title" do
      setup_ems(false)
      button.calculate_properties
      expect(button[:title]).to eq("No cloud providers support key pair import or creation.")
    end

    it "when the create action is supported, then the button has no error in the title" do
      setup_ems(true)
      button.calculate_properties
      expect(button[:title]).to be nil
    end
  end
end
