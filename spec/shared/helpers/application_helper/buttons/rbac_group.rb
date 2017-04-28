require 'shared/helpers/application_helper/buttons/basic'

shared_context 'ApplicationHelper::Button::RbacGroup' do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
end

shared_examples 'ApplicationHelper::Button::RbacGroup read-only record with restriction' do |restriction|
  context 'when record is read-only' do
    let(:record) { FactoryGirl.create(:miq_group, :system_type) }
    include_examples 'ApplicationHelper::Button::Basic disabled',
                     "This Group is Read Only and can not be #{restriction}"
  end
end

shared_examples 'ApplicationHelper::Button::RbacGroup writable record' do
  context 'when record is writable' do
    let(:record) { FactoryGirl.create(:miq_group) }
    include_examples 'ApplicationHelper::Button::Basic enabled'
  end
end
