describe ApplicationHelper::Button::VmMiqRequestNew do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:button)       { described_class.new(view_context, {}, {}, {}) }

  describe '#disabled?' do
    context "with no ext_management_systems" do
      it_behaves_like "a disabled button", "No Infrastructure Provider that supports VM provisioning added"
    end

    context "with a cloud ext_management_system" do
      let!(:ems) { FactoryBot.create(:ems_cloud) }

      it_behaves_like "a disabled button", "No Infrastructure Provider that supports VM provisioning added"
    end

    context "with an infrastructure ext_management_system" do
      let!(:ems) { FactoryBot.create(:ems_infra) }

      it_behaves_like "an enabled button"
    end
  end
end
