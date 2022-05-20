describe ApplicationHelper::Button::HostCheckCompliance do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:record) { FactoryBot.create(:vm) }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, {}) }

  describe '#disabled?' do
    subject { button[:title] }
    before { allow(record).to receive(:has_compliance_policies?).and_return(has_compliance_policies) }

    context 'and record has compliance policies' do
      let(:has_compliance_policies) { true }
      it_behaves_like 'an enabled button'
    end

    context 'and record has not compliance policies' do
      let(:has_compliance_policies) { false }
      it_behaves_like 'a disabled button',
                      'No Compliance Policies assigned to this Host'
    end
  end
end
