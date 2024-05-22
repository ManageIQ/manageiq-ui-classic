describe ApplicationHelper::Button::VolumeDetach do
  let(:record) { CloudVolume.new }
  let(:button) do
    described_class.new(
      setup_view_context_with_sandbox({}), {}, {"record" => record}, {}
    )
  end

  describe '#disabled?' do
    it "when the detach action is supported, then the button is enabled" do
      stub_supports(record.class, :detach)
      expect(button.disabled?).to be false
    end

    it "when the detach action is not supported, then the button is disabled" do
      stub_supports_not(record.class, :detach, "unavailable")
      expect(button.disabled?).to be true
    end
  end

  describe '#calculate_properties' do
    it "when the detach action is not supported, then the button has the error in the title" do
      stub_supports_not(record.class, :detach, "unavailable")
      button.calculate_properties
      expect(button[:title]).to eq("unavailable")
    end

    it "when the detach action is not supported, the button has no error in the title" do
      stub_supports(record.class, :detach)
      button.calculate_properties
      expect(button[:title]).to be nil
    end
  end
end
