describe ApplicationHelper::Button::CloudVolumeBackupRestore do
  describe "#disabled?" do
    let(:view_context) { setup_view_context_with_sandbox({}) }
    let(:button) { described_class.new(view_context, {}, {}, {}) }

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
end
