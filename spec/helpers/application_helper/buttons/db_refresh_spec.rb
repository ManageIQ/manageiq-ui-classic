require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::DbRefresh do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { {:active_tab => tab} }
  let(:instance_data) { Hash.new }
  let(:props) { Hash.new }

  describe '#visible?' do
    %w(db_details db_indexes db_settings db_connections).each do |tree|
      context "when active_tree == #{tree}" do
        let(:tab) { tree }
        include_examples 'ApplicationHelper::Button::Basic visible'
      end
    end
    context 'when !active_tree.in?(%w(db_details db_indexes db_settings db_connections))' do
      let(:tab) { 'something_else' }
      include_examples 'ApplicationHelper::Button::Basic hidden'
    end
  end
end
