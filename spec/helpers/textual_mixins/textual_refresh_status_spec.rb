describe TextualMixins::TextualRefreshStatus do
  describe "#status_type" do
    context "will not display success notification if refresh time is < 2 days" do
      subject { helper.status_type('success', 3.hours.ago) }
      it { is_expected.to eq({:stale => false, :type => 'success'}) }
    end

    context "will display error notification regardless of refresh time 3.hours.ago" do
      subject { helper.status_type('error', 3.hours.ago) }
      it { is_expected.to eq({:stale => false, :type => 'error'}) }
    end

    context "will display error notification regardless of refresh time 30.days.ago" do
      subject { helper.status_type('error', 30.days.ago) }
      it { is_expected.to eq({:stale => true, :type => 'error'}) }
    end

    context "will dispay warning notification if refresh time is > 2 days" do
      subject { helper.status_type('success', 30.days.ago) }
      it { is_expected.to eq({:stale => true, :type => 'warning'}) }
    end
  end
end
