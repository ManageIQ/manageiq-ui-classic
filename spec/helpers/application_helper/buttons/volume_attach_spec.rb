describe ApplicationHelper::Button::VolumeAttach do
  describe '#disabled?' do
    it "when the attach action is available and the volume.status is available then the button is enabled" do
      view_context = setup_view_context_with_sandbox({})
      button = described_class.new(
        view_context, {}, {"record" => object_double(CloudVolume.new, :is_available? => true, :status => 'available')}, {}
      )
      expect(button.disabled?).to be false
    end

    it "when the attach action is unavailable then the button is disabled" do
      view_context = setup_view_context_with_sandbox({})
      button = described_class.new(
        view_context, {},
        {"record" => object_double(CloudVolume.new, :is_available?                  => false,
                                                    :status                         => 'available',
                                                    :is_available_now_error_message => "unavailable")}, {}
      )
      expect(button.disabled?).to be true
    end

    it "when the volume.status is not available then the button is disabled" do
      view_context = setup_view_context_with_sandbox({})
      button = described_class.new(
        view_context, {}, {"record" => object_double(CloudVolume.new, :is_available? => true,
                                                                      :status        => 'in-use',
                                                                      :name          => 'TestVolume')}, {}
      )
      expect(button.disabled?).to be true
    end
  end

  describe '#calculate_properties' do
    it "when the attach action is unavailable the button has the error in the title" do
      view_context = setup_view_context_with_sandbox({})
      button = described_class.new(
        view_context, {}, {"record" => object_double(
          CloudVolume.new, :is_available? => false, :status => 'available', :is_available_now_error_message => "unavailable"
        )}, {}
      )
      button.calculate_properties
      expect(button[:title]).to eq("unavailable")
    end

    it "when the volume.status is not available then the button has the error in the title" do
      view_context = setup_view_context_with_sandbox({})
      button = described_class.new(
        view_context, {}, {"record" => object_double(
          CloudVolume.new, :is_available? => true, :status => 'in-use', :name => "TestVolume"
        )}, {}
      )
      button.calculate_properties
      expect(button[:title]).to eq("Cloud Volume \"TestVolume\" is not available to be attached to any Instances")
    end

    it "when the volume.status is available and the attach action is available, the button has no error in the title" do
      view_context = setup_view_context_with_sandbox({})
      button = described_class.new(
        view_context, {}, {"record" => object_double(
          CloudVolume.new, :is_available? => true, :status => 'available'
        )}, {}
      )
      button.calculate_properties
      expect(button[:title]).to be nil
    end
  end
end
