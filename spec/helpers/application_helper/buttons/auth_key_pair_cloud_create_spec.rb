describe ApplicationHelper::Button::AuthKeyPairCloudCreate do
  let(:button) { described_class.new(setup_view_context_with_sandbox({}), {}, {}, {}) }
  let(:ems)    { FactoryBot.create(:ems_cloud) }

  describe '#disabled?' do
    context 'when the create action is supported' do
      before { stub_supports(ems.class::AuthKeyPair, :create) }

      it 'then the button is enabled' do
        expect(button.disabled?).to be false
      end
    end

    context 'when the create action is not supported' do
      before { stub_supports_not(ems.class::AuthKeyPair, :create) }

      it 'then the button is disabled' do
        expect(button.disabled?).to be true
      end
    end
  end

  describe '#calculate_properties' do
    context "when the create action is not supported" do
      before { stub_supports_not(ems.class::AuthKeyPair, :create) }

      it "then the button has the error in the title" do
        button.calculate_properties
        expect(button[:title]).to eq("No cloud providers support key pair import or creation.")
      end
    end

    context "when the create action is supported" do
      before { stub_supports(ems.class::AuthKeyPair, :create) }

      it "then the button has no error in the title" do
        button.calculate_properties
        expect(button[:title]).to be nil
      end
    end
  end
end
