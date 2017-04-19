require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::DialogAction do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'edit' => edit} }
  let(:props) { Hash.new }

  context 'when edit' do
    let(:edit) { {:current => current} }
    context 'and edit[:current]' do
      let(:current) { 'something' }
      it { expect(subject.visible?).to be_falsey }
    end
    context 'and edit[:current] == nil' do
      let(:current) { nil }
      it { expect(subject.visible?).to be_truthy }
    end
  end

  context 'when edit == nil' do
    let(:edit) { nil }
    it { expect(subject.visible?).to be_truthy }
  end
end
