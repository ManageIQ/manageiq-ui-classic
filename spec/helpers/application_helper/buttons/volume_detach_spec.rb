describe ApplicationHelper::Button::VolumeDetach do
  def setup_button(supports)
    volume = object_double(CloudVolume.new)
    allow(volume).to receive(:supports?).with(:detach_volume).and_return(supports)
    allow(volume).to receive(:unsupported_reason).with(:detach_volume).and_return("unavailable")
    described_class.new(
      setup_view_context_with_sandbox({}), {}, {"record" => volume}, {}
    )
  end

  describe '#disabled?' do
    it "when the detach action is supported, then the button is enabled" do
      button = setup_button(true)
      expect(button.disabled?).to be false
    end

    it "when the detach action is not supported, then the button is disabled" do
      button = setup_button(false)
      expect(button.disabled?).to be true
    end
  end

  describe '#calculate_properties' do
    it "when the detach action is not supported, then the button has the error in the title" do
      button = setup_button(false)
      button.calculate_properties
      expect(button[:title]).to eq("unavailable")
    end

    it "when the detach action is not supported, the button has no error in the title" do
      button = setup_button(true)
      button.calculate_properties
      expect(button[:title]).to be nil
    end
  end
end
