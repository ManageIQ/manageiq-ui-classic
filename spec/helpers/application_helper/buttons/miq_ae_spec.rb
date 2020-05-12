describe ApplicationHelper::Button::MiqAe do
  let(:session) { {} }
  let(:view_context) { setup_view_context_with_sandbox({}) }
  subject { described_class.new(view_context, {}, {'record' => record}, {:child_id => child_id}) }

  before { login_as FactoryBot.create(:user, :with_miq_edit_features) }

  describe '#visible?' do
    context 'when button does not copy' do
      let(:child_id) { 'miq_ae_domain_edit' }
      let(:record) { FactoryBot.build(:miq_ae_domain_enabled) }
      it { expect(subject.visible?).to be_falsey }
    end
    context do
      let(:child_id) { 'miq_ae_class_copy' }
      context 'when editable domains not available' do
        let(:record) { FactoryBot.build(:miq_ae_domain_disabled) }
        it { expect(subject.visible?).to be_falsey }
      end
      context 'when editable domains available' do
        let(:record) { FactoryBot.create(:miq_ae_class) }
        it { expect(subject.visible?).to be_truthy }
      end
    end
  end

  describe '#disabled?' do
    context 'when domains not editable' do
      let(:child_id) { 'miq_ae_domain_edit' }
      let(:record) { FactoryBot.build(:miq_ae_domain_disabled) }
      it { expect(subject.disabled?).to be_falsey }
    end
    context 'when domains not available for copy but editable' do
      let(:child_id) { 'miq_ae_domain_copy' }
      let(:record) { FactoryBot.build(:miq_ae_domain_enabled) }
      it { expect(subject.disabled?).to be_falsey }
    end
    context 'when domains are not editable and not available for copy' do
      let(:child_id) { 'miq_ae_domain_edit' }
      let(:record) { FactoryBot.build(:miq_ae_system_domain) }
      it { expect(subject.disabled?).to be_truthy }
    end
  end
end
