require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::MiqActionModify do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { {:active_tree => tree} }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:record) { FactoryGirl.create(:miq_event_definition) }
  let(:tree) { :policy_tree }

  describe '#visible?' do
    context 'when active_tree is :event_tree' do
      let(:tree) { :event_tree }
      include_examples 'ApplicationHelper::Button::Basic hidden'
    end
    context 'when active_tree is :policy_tree' do
      include_examples 'ApplicationHelper::Button::Basic visible'
    end
  end

  describe '#disabled?' do
    before { allow(view_context).to receive(:x_node).and_return("p-#{policy.id}_ev-1") }

    context 'when policy is read_only' do
      let(:policy) { FactoryGirl.create(:miq_policy_read_only) }
      it { expect(subject.disabled?).to be_truthy }
    end
    context 'when policy is not read-only' do
      let(:policy) { FactoryGirl.create(:miq_policy) }
      it { expect(subject.disabled?).to be_falsey }
    end
  end

  describe '#calculate_properties' do
    let(:messages) do
      ['This Action belongs to a read only Policy and cannot be modified',
       'This Event belongs to a read only Policy and cannot be modified',
       nil]
    end
    let(:policy) { FactoryGirl.create(:miq_policy_read_only) }

    before { allow(view_context).to receive(:x_node).and_return("p-#{policy.id}_#{type}-1") }
    before(:each) { subject.calculate_properties }

    %w(a ev u).each_with_index do |type, i|
      context "when #{type} is active" do
        let(:type) { type }
        it { expect(subject[:title]).to eq(messages[i]) }
      end
    end
  end
end
