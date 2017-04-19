require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::EmsInfraScale do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:record) { FactoryGirl.create(:ems_openstack_infra) }

  describe '#visible?' do
    context 'when record is OpenStack Provider' do
      context 'and orchestration stack is empty' do
        it { expect(subject.visible?).to be_falsey }
      end
      context 'and orchestration stack is not empty' do
        let(:record) { FactoryGirl.create(:ems_openstack_infra_with_stack) }
        it { expect(subject.visible?).to be_truthy }
      end
    end
    context 'when record is not an OpenStack provider' do
      let(:record) { :ems_redhat }
      it { expect(subject.visible?).to be_falsey }
    end
  end
end
