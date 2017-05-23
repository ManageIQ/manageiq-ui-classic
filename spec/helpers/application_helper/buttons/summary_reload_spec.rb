require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::SummaryReload do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) do
    {'record' => record, 'explorer' => explorer, 'layout' => layout, 'showtype' => showtype, 'lastaction' => lastaction}
  end
  let(:props) { Hash.new }
  let(:record) { true }
  let(:explorer) { true }
  let(:layout) { 'not_miq_policy_rsop' }
  let(:showtype) { true }
  let(:lastaction) { nil }

  shared_examples 'lastaction_examples' do
    context 'when lastaction is show_list' do
      let(:lastaction) { 'show_list' }
      include_examples 'ApplicationHelper::Button::Basic visible'
    end
    context 'when lastaction is not show_list' do
      let(:lastaction) { 'not_show_list' }
      include_examples 'ApplicationHelper::Button::Basic hidden'
    end
  end

  describe '#visible?' do
    context 'when in explorer' do
      context 'when record set' do
        context 'when layout is not miq_policy_rsop' do
          context 'when showtype not in %w(details item)' do
            include_examples 'ApplicationHelper::Button::Basic visible'
          end
          %w(details item).each do |showtype|
            context "when showtype == #{showtype}" do
              let(:showtype) { showtype }
              include_examples 'lastaction_examples'
            end
          end
        end
        context 'when layout is miq_policy_rsop' do
          let(:layout) { 'miq_policy_rsop' }
          include_examples 'lastaction_examples'
        end
      end
      context 'when record not set' do
        let(:record) { false }
        include_examples 'lastaction_examples'
      end
    end
    context 'when not in explorer' do
      let(:explorer) { false }
      include_examples 'ApplicationHelper::Button::Basic hidden'
    end
  end
end
