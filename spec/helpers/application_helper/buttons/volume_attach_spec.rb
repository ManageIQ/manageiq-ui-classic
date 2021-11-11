describe ApplicationHelper::Button::VolumeAttach do
  let (:volume_name)  { "TestVolume" }
  let (:cloud_volume) { double(CloudVolume.new, :name => volume_name) }
  let (:unsupported_reason) { "Reasons" }

  describe '#disabled?' do
    it "when the attach action is available then the button is enabled" do
      view_context = setup_view_context_with_sandbox({})
      expect(cloud_volume).to receive(:supports?).with(:attach_volume).and_return(true)

      button = described_class.new(
        view_context, {}, {"record" => cloud_volume}, {}
      )
      expect(button.disabled?).to be false
    end

    it "when the attach action is unavailable then the button is disabled" do
      view_context = setup_view_context_with_sandbox({})
      expect(cloud_volume).to receive(:supports?).with(:attach_volume).and_return(false)
      expect(cloud_volume).to receive(:unsupported_reason).with(:attach_volume).and_return(unsupported_reason)
      button = described_class.new(
        view_context, {}, {"record" => cloud_volume}, {}
      )
      expect(button.disabled?).to be true
    end
  end

  describe '#calculate_properties' do
    it "when the attach action is unavailable the button has the error in the title" do
      view_context = setup_view_context_with_sandbox({})
      expect(cloud_volume).to receive(:supports?).with(:attach_volume).and_return(false)
      expect(cloud_volume).to receive(:unsupported_reason).with(:attach_volume).and_return(unsupported_reason)
      button = described_class.new(
        view_context, {}, {"record" => cloud_volume}, {}
      )
      button.calculate_properties
      expect(button[:title]).to eq("Cloud Volume \"#{volume_name}\" cannot be attached because #{unsupported_reason}"
)
    end

    it "when the volume.status is available and the attach action is available, the button has no error in the title" do
      view_context = setup_view_context_with_sandbox({})
      expect(cloud_volume).to receive(:supports?).with(:attach_volume).and_return(true)
      button = described_class.new(
        view_context, {}, {"record" => cloud_volume}, {}
      )
      button.calculate_properties
      expect(button[:title]).to be nil
    end
  end
end
