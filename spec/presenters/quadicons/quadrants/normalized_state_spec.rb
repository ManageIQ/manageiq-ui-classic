describe Quadicons::Quadrants::NormalizedState, :type => :helper do
  let(:record) { FactoryGirl.build(:host) }
  let(:kontext) { Quadicons::Context.new(helper) }
  subject(:nstate) { Quadicons::Quadrants::NormalizedState.new(record, kontext) }

  context 'when state is archived' do
    before do
      allow(record).to receive(:normalized_state) { 'archived' }
    end

    it 'renders a value-quadrant with A' do
      expect(nstate.render).to have_selector('span')
      expect(nstate.render).to match /A/
    end
  end

  context 'when state is on' do
    before do
      allow(record).to receive(:normalized_state) { 'on' }
    end

    it 'builds an image path' do
      expect(nstate.path).to eq 'svg/currentstate-on.svg'
    end

    it 'renders an image_tag' do
      expect(nstate.render).to have_selector('img')
    end
  end
end
