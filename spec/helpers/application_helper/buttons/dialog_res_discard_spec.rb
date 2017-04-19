require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::DialogResDiscard do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { {:edit_typ => edit_typ} }
  let(:instance_data) { {'edit' => edit} }
  let(:props) { Hash.new }

  context 'when edit' do
    let(:edit) { true }
    context 'and @sb[:edit_typ] == add' do
      let(:edit_typ) { 'add' }
      it { expect(subject.visible?).to be_truthy }
    end
    context 'and @sb[:edit_typ] != add' do
      let(:edit_typ) { 'not_add' }
      it { expect(subject.visible?).to be_falsey }
    end
  end

  context 'when edit == nil' do
    let(:edit) { nil }
    let(:edit_typ) { 'does not matter' }
    it { expect(subject.visible?).to be_falsey }
  end
end
