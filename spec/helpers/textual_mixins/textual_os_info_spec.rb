describe TextualMixins::TextualOsInfo do
  let(:host) { FactoryBot.create(:host) }

  before do
    assign(:record, host)
  end

  describe "#os_info_details" do
    subject { helper.os_info_details }

    context "without unknown OS" do
      it { is_expected.to be_empty }
    end

    context "with OS" do
      let(:host) do
        FactoryBot.create(:host,
                          :operating_system => FactoryBot.create(:operating_system,
                                                                 :product_name => "rhel-7x64"))
      end

      it { is_expected.not_to be_empty }
    end
  end
end
