describe ApplicationHelper::Button::GenericFeatureButtonWithDisable do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:record) { FactoryBot.create(:vm_vmware) }
  let(:feature) { :evacuate }
  let(:props) { {:options => {:feature => feature}} }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, props) }

  context 'the feature is unavailable' do
    let(:supports_feature) { false }

    it 'the button is visible' do
      expect(button.visible?).to be_truthy
    end

    it 'the button has error message in the title' do
      button.calculate_properties
      expect(button[:title]).not_to be(nil)
    end
  end
end
