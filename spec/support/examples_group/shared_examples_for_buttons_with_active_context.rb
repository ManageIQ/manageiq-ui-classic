shared_examples 'a button with correct active context' do |tree, tab|
  describe '#visible?' do
    subject { button.visible? }
    context "when active_tree == #{tree} and active_tab == #{tab}" do
      let(:tree) { tree }
      let(:tab) { tab }
      it { expect(subject).to be_truthy }
    end
  end
end

shared_examples 'a button with incorrect active context' do |tree, tab|
  describe '#visible?' do
    subject { button.visible? }
    context "when active_tree == #{tree} and active_tab == #{tab}" do
      let(:tree) { tree }
      let(:tab) { tab }
      it { expect(subject).to be_falsey }
    end
  end
end
