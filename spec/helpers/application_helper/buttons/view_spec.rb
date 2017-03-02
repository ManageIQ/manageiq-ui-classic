describe ApplicationHelper::Button::View do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:instance_data) { {'gtl_type' => gtl_type, 'gtl_buttons' => gtl_buttons} }
  let(:button_id) { 'view_grid' }
  let(:gtl_type) { 'grid' }
  let(:gtl_buttons_orig) { %w(view_grid view_tile view_list) }
  let(:button) { described_class.new(view_context, {}, instance_data, :id => button_id) }

  describe '#visible?' do
    subject { button.visible? }
    context 'when gtl buttons is set' do
      let(:gtl_buttons) { gtl_buttons_orig }
      context 'and contains gtl button' do
        it { expect(subject).to be_truthy }
      end
      context 'and does not contain gtl button' do
        let(:gtl_buttons) { gtl_buttons_orig - [button_id] }
        it { expect(subject).to be_falsey }
      end
    end
    context 'when gtl_buttons is not set or is false' do
      let(:gtl_buttons) { false }
      it { expect(subject).to be_truthy }
    end
  end

  describe '#calculate_properties' do
    let(:gtl_buttons) { gtl_buttons_orig }
    before { button.calculate_properties }

    context 'when gtl_type is set' do
      it_behaves_like 'a disabled button'
    end
    context 'when gtl_type is not set or false' do
      let(:gtl_type) { false }
      it_behaves_like 'an enabled button'
    end
  end
end
