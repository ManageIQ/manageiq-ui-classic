require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::View do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'gtl_type' => gtl_type, 'gtl_buttons' => gtl_buttons} }
  let(:props) { {:id => button_id} }
  let(:gtl_type) { 'grid' }
  let(:gtl_buttons_orig) { %w(view_grid view_tile view_list) }
  let(:button_id) { 'view_grid' }

  describe '#visible?' do
    context 'when gtl buttons is set' do
      let(:gtl_buttons) { gtl_buttons_orig }
      context 'and contains gtl button' do
        include_examples 'ApplicationHelper::Button::Basic#visible?', true
      end
      context 'and does not contain gtl button' do
        let(:gtl_buttons) { gtl_buttons_orig - [button_id] }
        include_examples 'ApplicationHelper::Button::Basic#visible?', false
      end
    end
    context 'when gtl_buttons is not set or is false' do
      let(:gtl_buttons) { false }
      include_examples 'ApplicationHelper::Button::Basic#visible?', true
    end
  end

  describe '#calculate_properties' do
    let(:gtl_buttons) { gtl_buttons_orig }
    before { subject.calculate_properties }

    context 'when gtl_type is set' do
      include_examples 'ApplicationHelper::Button::Basic disabled', :error_message => nil
    end
    context 'when gtl_type is not set or false' do
      let(:gtl_type) { false }
      include_examples 'ApplicationHelper::Button::Basic enabled'
    end
  end
end
