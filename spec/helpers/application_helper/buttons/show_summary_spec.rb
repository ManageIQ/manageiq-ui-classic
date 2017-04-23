require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::ShowSummary do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'explorer' => explorer} }
  let(:props) { Hash.new }

  describe '#visible?' do
    [true, false].each do |explorer|
      context "when explorer evals as #{explorer}" do
        let(:explorer) { explorer }
        include_examples 'ApplicationHelper::Button::Basic#visible?', !explorer
      end
    end
  end
end
