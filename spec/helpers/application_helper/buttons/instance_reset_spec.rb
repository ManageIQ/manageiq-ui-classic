describe ApplicationHelper::Button::InstanceReset do
  include Spec::Support::SupportsHelper

  describe '#visible?' do
    context "when record is resetable" do
      before do
        @record = FactoryBot.create(:vm_openstack)
        stub_supports(@record, :reset)
      end

      it_behaves_like "will not be skipped for this record"
    end

    context "when record is not resetable" do
      before do
        @record = FactoryBot.create(:vm_openstack)
        stub_supports_not(@record, :reset)
      end

      it_behaves_like "will be skipped for this record"
    end
  end
end
