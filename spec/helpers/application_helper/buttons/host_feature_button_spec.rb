require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::HostFeatureButton do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { {:options => {:feature => feature}} }
  let(:record) { FactoryGirl.create(:ems_openstack_infra) }
  let(:feature) { :standby }

  it_behaves_like 'a generic feature button after initialization'

  describe '#visible?' do
    context 'when record.kind_of?(ManageIQ::Providers::Openstack::InfraManager)' do
      %w(start stop).each do |feature|
        context "and feature is #{feature}" do
          let(:feature) { feature }
          include_examples 'ApplicationHelper::Button::Basic#visible?', true
        end
      end
      context 'and feature is other than start or stop' do
        let(:feature) { :stand_by }
        include_examples 'ApplicationHelper::Button::Basic#visible?', false
      end
    end
    context 'when record.kind_of?(ManageIQ::Providers::Openstack::InfraManager::Host)' do
      let(:record) { FactoryGirl.create(:host_openstack_infra) }
      before { allow(record).to receive(:is_available?).and_return(available) }
      context 'and feature is available' do
        let(:feature) { :stop }
        let(:available) { true }
        include_examples 'ApplicationHelper::Button::Basic#visible?', true
      end
      context 'and feature is unavailable' do
        let(:feature) { :shutdown }
        let(:available) { false }
        include_examples 'ApplicationHelper::Button::Basic#visible?', false
      end
    end
    context 'when there is no record' do
      let(:record) { nil }
      include_examples 'ApplicationHelper::Button::Basic#visible?', true
    end
    context 'when feature is nil' do
      let(:feature) { nil }
      include_examples 'ApplicationHelper::Button::Basic#visible?', true
    end
  end
end
