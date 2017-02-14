describe DashboardController do
  describe '#start_page_allowed?' do
    let(:controller) { described_class.new }
    let(:subj) { ->(page) { controller.send(:start_page_allowed?, page) } }

    before do
      stub_user(:features => :all)
    end

    it 'should return true for host start page' do
      expect(subj.call('host_show_list')).to be_truthy
    end
  end
end
