describe ApplicationHelper::Button::VmReconfigure do
  describe '#visible?' do
    before do
      @view_context = setup_view_context_with_sandbox({})
      allow(@view_context).to receive(:role_allows?).and_return(true)
    end

    context "record is vmware vm" do
      before do
        @record = FactoryBot.create(:vm_vmware, :ext_management_system => FactoryBot.create(:ems_infra))
      end

      it_behaves_like "will not be skipped for this record"
    end

    context "record is vmware template" do
      before do
        @record = FactoryBot.create(:template_vmware)
      end

      it_behaves_like "will be skipped for this record"
    end
  end
end
