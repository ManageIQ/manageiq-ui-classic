describe ApplicationHelper::Button::MiddlewareServerAction do
  let(:record) { double("MiddlewareServer") }
  subject(:action) { described_class.new(setup_view_context_with_sandbox({}), {}, {'record' => record}, {}) }

  describe '#visible?' do
    it 'is true if record is mutable' do
      allow(record).to receive(:mutable?) { true }
      expect(action).to be_visible
    end

    it 'is false if record is immutable' do
      allow(record).to receive(:mutable?) { false }
      expect(action).not_to be_visible
    end

    it 'is false if record is nil' do
      action = described_class.new(setup_view_context_with_sandbox({}), {}, {}, {})
      expect(action).not_to be_visible
    end
  end
end
