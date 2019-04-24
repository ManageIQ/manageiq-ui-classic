describe MiqAeToolsHelper do
  describe "#git_import_button_enabled?" do
    let(:my_region) { double("MiqRegion") }

    before do
      allow(MiqRegion).to receive(:my_region).and_return(my_region)
      allow(my_region).to receive(:role_active?).with("git_owner").and_return(active_git_owner)
    end

    context "when the MiqRegion has an active git_owner role" do
      let(:active_git_owner) { true }

      it "returns true" do
        expect(helper.git_import_button_enabled?).to eq(true)
      end
    end

    context "when the MiqRegion does not have an active git_owner role" do
      let(:active_git_owner) { false }

      it "returns false" do
        expect(helper.git_import_button_enabled?).to eq(false)
      end
    end
  end
end
