describe ApplicationHelper::Button::MiddlewareDomainServerAction do
  let(:record) { double("MiddlewareServer") }
  subject(:action) { described_class.new(setup_view_context_with_sandbox({}), {}, {'record' => record}, {}) }

  describe '#visible?' do
    it 'is true if server is in domain' do
      allow(record).to receive(:in_domain?) { true }

      expect(action).to be_visible
    end

    it 'is false if server is not in domain' do
      allow(record).to receive(:in_domain?) { false }

      expect(action).not_to be_visible
    end

    it 'is false if record is nil' do
      action = described_class.new(setup_view_context_with_sandbox({}), {}, {'record' => record}, {})
      expect(action).not_to be_visible
    end
  end
end
