describe ApplicationHelper::Button::AuthKeyPairCloudCreate do
  include Spec::Support::SupportsHelper

  let(:button) { described_class.new(setup_view_context_with_sandbox({}), {}, {}, {}) }
  let(:ems)    { FactoryBot.create(:ems_cloud) }

  before { stub_supports(ems.class::AuthKeyPair, :create, :supported => supported) }

  describe '#disabled?' do
    context 'when the create action is supported' do
      let(:supported) { true }

      it 'then the button is enabled' do
        expect(button.disabled?).to be false
      end
    end

    context 'when the create action is not supported' do
      let(:supported) { false }

      it 'then the button is disabled' do
        expect(button.disabled?).to be true
      end
    end
  end

  describe '#calculate_properties' do
    context "when the create action is not supported" do
      let(:supported) { false }

      it "then the button has the error in the title" do
        button.calculate_properties
        expect(button[:title]).to eq("No cloud providers support key pair import or creation.")
      end
    end

    context "when the create action is supported" do
      let(:supported) { true }

      it "then the button has no error in the title" do
        button.calculate_properties
        expect(button[:title]).to be nil
      end
    end
  end
end
