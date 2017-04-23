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
        include_examples 'ApplicationHelper::Button::Basic#visible?', false
      end
    end
    context 'when !layout.in(%w(all_tasks my_tasks))' do
      let(:layout) { 'something' }
      include_examples 'ApplicationHelper::Button::Basic#visible?', true
    end
  end
end
