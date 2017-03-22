describe Quadicons::Quadrants::TypeIcon, :type => :helper do
  let(:kontext) { Quadicons::Context.new(helper) }
  subject(:quadrant) { Quadicons::Quadrants::TypeIcon.new(record, kontext) }

  let(:record) { FactoryGirl.create(:resource_pool) }

  context "when record is decorated" do
    it 'uses the listicon_image method' do
      expect(quadrant.path).to match(/resource_pool/)
    end
  end

  context "when record is not decorated" do
    it 'falls back to class name' do
      expect(record).to receive(:decorate) { nil }
      expect(quadrant.path).to match(/resource_pool/)
    end
  end
end
