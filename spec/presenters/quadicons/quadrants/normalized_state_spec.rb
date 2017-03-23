describe Quadicons::Quadrants::NormalizedState, :type => :helper do
  let(:record) { FactoryGirl.build(:host) }
  let(:kontext) { Quadicons::Context.new(helper) }
  subject(:nstate) { Quadicons::Quadrants::NormalizedState.new(record, kontext) }

  context 'when state is archived' do
    before do
      allow(record).to receive(:normalized_state) { 'archived' }
    end

    it 'returns an image path' do
      expect(nstate.path).to eq 'svg/currentstate-archived.svg'
    end
  end

  context 'when state is on' do
    before do
      allow(record).to receive(:normalized_state) { 'on' }
    end

    it 'returns an image path' do
      expect(nstate.path).to eq 'svg/currentstate-on.svg'
    end
  end
end
