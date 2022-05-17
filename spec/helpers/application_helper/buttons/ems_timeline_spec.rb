describe ApplicationHelper::Button::EmsTimeline do
  include Spec::Support::SupportsHelper

  # there are no events. reference event to create it
  let(:event)        { FactoryBot.create(:ems_event, :vm_or_template => record) }
  let(:record)       { FactoryBot.build(:vm_cloud) }
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:button)       { described_class.new(view_context, {}, {"record" => record}, {}) }

  describe '#disabled?' do
    context "when the timeline action is available" do
      before { stub_supports(record, :timeline) }
      it "is not disabled" do
        event
        expect(button.disabled?).to be false
      end
    end

    context "when the timeline action is unavailable" do
      before { stub_supports_not(record, :timeline) }
      it "is disabled" do
        expect(button.disabled?).to be true
      end
    end
  end

  describe '#calculate_properties' do
    context "when the timeline action is unavailable" do
      before { stub_supports_not(record, :timeline) }
      it "has the error in the title" do
        button.calculate_properties
        expect(button[:title]).to eq("No Timeline data has been collected for this Provider")
      end
    end

    context "when the timeline is available" do
      before { stub_supports(record, :timeline) }
      it "has no error in the title" do
        event
        button.calculate_properties
        expect(button[:title]).to be nil
      end
    end
  end
end
