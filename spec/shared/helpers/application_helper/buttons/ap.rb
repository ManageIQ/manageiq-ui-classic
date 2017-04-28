require 'shared/helpers/application_helper/buttons/basic'

# shared context for Analysis Profile buttons
shared_context 'ApplicationHelper::Button::Ap' do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:record) { FactoryGirl.create(:scan_item_set, :read_only => read_only) }
end

shared_examples 'ApplicationHelper::Button::Ap read-only with restriction' do |restriction|
  context 'when Analysis Profile is read-only' do
    let(:read_only) { true }
    include_examples 'ApplicationHelper::Button::Basic disabled',
                     "Sample Analysis Profile cannot be #{restriction}"
  end
end

shared_examples 'ApplicationHelper::Button::Ap writable' do
  let(:read_only) { false }
  it_behaves_like 'an enabled button'
end
