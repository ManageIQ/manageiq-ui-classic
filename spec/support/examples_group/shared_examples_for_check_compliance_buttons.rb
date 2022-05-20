shared_examples_for 'a check_compliance button' do |entity|
  before { allow(record).to receive(:has_compliance_policies?).and_return(has_policies) }

  describe '#disabled?' do
    context 'when record has compliance policies' do
      let(:has_policies) { true }
      it_behaves_like 'an enabled button'
    end
    context 'when record does not have compliance policies' do
      let(:has_policies) { false }
      it_behaves_like 'a disabled button', "No Compliance Policies assigned to this #{entity}"
    end
  end
end
