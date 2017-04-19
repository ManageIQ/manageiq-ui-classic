require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::MiqTaskCanceljob do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'layout' => layout} }
  let(:props) { Hash.new }

  describe '#visible?' do
    %w(all_tasks my_tasks).each do |layout|
      context "when layout == #{layout}" do
        let(:layout) { layout }
        it { expect(subject.visible?).to be_falsey }
      end
    end
    context 'when !layout.in(%w(all_tasks my_tasks))' do
      let(:layout) { 'something' }
      it { expect(subject.visible?).to be_truthy }
    end
  end
end
