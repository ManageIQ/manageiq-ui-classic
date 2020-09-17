describe ApplicationHelper::Button::GenericFeatureShowListButton do
  let(:view_context) { setup_view_context_with_sandbox({}) }

  describe "#backup_create" do
    let(:feature) { :backup_create }
    let(:props) do
      {:options => {:feature      => feature,
                    :managers     => %w[StorageManager CloudManager],
                    :target_class => "CloudVolume"}}
    end
    let(:button) { described_class.new(view_context, {}, {}, props) }

    context "with no providers" do
      it "the button is disabled" do
        expect(button.disabled?).to be true
      end
    end

    context "with an OpenStack CloudManager supporting backup_create" do
      before { FactoryBot.create(:ems_openstack) }

      it "the button is enabled" do
        expect(button.disabled?).to be false
      end
    end

    context "with an Amazon CloudManager not supporting backup_create" do
      before { FactoryBot.create(:ems_amazon) }

      it "the button is disabled" do
        expect(button.disabled?).to be true
      end
    end
  end

  describe "#backup_restore" do
    let(:feature) { :backup_restore }
    let(:props) do
      {:options => {:feature      => feature,
                    :managers     => %w[StorageManager CloudManager],
                    :target_class => "CloudVolume"}}
    end
    let(:button) { described_class.new(view_context, {}, {}, props) }

    context "with no providers" do
      it "the button is disabled" do
        expect(button.disabled?).to be true
      end
    end

    context "with an OpenStack CloudManager supporting backup_restore" do
      before { FactoryBot.create(:ems_openstack) }

      it "the button is enabled" do
        expect(button.disabled?).to be false
      end
    end

    context "with an Amazon CloudManager not supporting backup_restore" do
      before { FactoryBot.create(:ems_amazon) }

      it "the button is disabled" do
        expect(button.disabled?).to be true
      end
    end
  end

  describe "#safe_delete" do
    let(:feature) { :safe_delete }
    let(:props) do
      {:options => {:feature      => feature,
                    :managers     => %w[StorageManager CloudManager],
                    :target_class => "CloudVolume"}}
    end
    let(:button) { described_class.new(view_context, {}, {}, props) }

    context "with no providers" do
      it "the button is disabled" do
        expect(button.disabled?).to be true
      end
    end

    context "with an AutoSDE StorageManager supporting safe_delete" do
      before { FactoryBot.create(:ems_autosde) }

      it "the button is enabled" do
        expect(button.disabled?).to be false
      end
    end

    context "with an Amazon CloudManager not supporting safe_delete" do
      before { FactoryBot.create(:ems_amazon) }

      it "the button is disabled" do
        expect(button.disabled?).to be true
      end
    end
  end
end
