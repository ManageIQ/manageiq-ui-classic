describe TextualMixins::TextualVmmInfo do
  let(:host) { FactoryBot.create(:host, :vmm_vendor => vmm) }

  before do
    assign(:record, host)
  end

  describe "#vmm_info_details" do
    subject { helper.vmm_info_details }

    context "without VMM info" do
      let(:vmm) { nil }

      it "returns Unknown" do
        is_expected.not_to be_empty
        expect(subject.first).to have_attributes(:description => "Unknown")
      end
    end

    context "with VMM info" do
      let(:vmm) { "vmware" }
      it { is_expected.not_to be_empty }
    end
  end
end
