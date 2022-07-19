describe ApplicationHelper::Button::VolumeAttach do
  let(:volume_name)  { "TestVolume" }
  let(:cloud_volume) { CloudVolume.new(:name => volume_name) }
  let(:unsupported_reason) { "Reasons" }
  let(:button) do
    view_context = setup_view_context_with_sandbox({})
    described_class.new(
      view_context, {}, {"record" => cloud_volume}, {}
    )
  end

  describe '#disabled?' do
    it "when the attach action is available then the button is enabled" do
      stub_supports(cloud_volume.class, :attach)

      expect(button.disabled?).to be false
    end

    it "when the attach action is unavailable then the button is disabled" do
      stub_supports_not(cloud_volume.class, :attach, unsupported_reason)
      expect(button.disabled?).to be true
    end
  end

  describe '#calculate_properties' do
    it "when the attach action is unavailable the button has the error in the title" do
      stub_supports_not(cloud_volume.class, :attach, unsupported_reason)
      button.calculate_properties
      expect(button[:title]).to eq("Cloud Volume \"#{volume_name}\" cannot be attached because #{unsupported_reason}")
    end

    it "when the volume.status is available and the attach action is available, the button has no error in the title" do
      stub_supports(cloud_volume.class, :attach)
      button.calculate_properties
      expect(button[:title]).to be nil
    end
  end
end
