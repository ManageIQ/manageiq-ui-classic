describe ApplicationHelper::Button::MiqReportCopy do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  subject { described_class.new(view_context, {}, {'record' => record}, {}) }

  describe '#disabled?' do
    context 'when @record.db == MiddlewareServerPerformance' do
      let(:record) { FactoryGirl.create(:miq_report, :db => 'MiddlewareServerPerformance') }
      it { expect(subject.disabled?).to be_truthy }
    end
    context 'when @record.db == MiddlewareDatasourcePerformance' do
      let(:record) { FactoryGirl.create(:miq_report, :db => 'MiddlewareDatasourcePerformance') }
      it { expect(subject.disabled?).to be_truthy }
    end
    context 'when @record.db is another' do
      let(:record) { FactoryGirl.create(:miq_report, :db => 'Vm') }
      it { expect(subject.disabled?).to be_falsey }
    end
  end
end
