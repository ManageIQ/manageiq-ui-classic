require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::InstanceRetire do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:record) { FactoryGirl.create(:vm, :retired => retired) }

  describe '#disabled?' do
    [true, false].each do |retired|
      context "when record.retired == #{retired}" do
        let(:retired) { retired }
        it { expect(subject.disabled?).to eq(retired) }
      end
    end
  end
end
