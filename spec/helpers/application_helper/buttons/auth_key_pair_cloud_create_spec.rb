describe ApplicationHelper::Button::AuthKeyPairCloudCreate do
  let(:button) { described_class.new(setup_view_context_with_sandbox({}), {}, {}, {}) }

  def setup_ems(supports)
    ems = FactoryBot.create(:ems_cloud)
    allow(ManageIQ::Providers::CloudManager).to receive(:where).and_return(supports ? [ems] : [])
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
