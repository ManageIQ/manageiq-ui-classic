require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::HistoryItem do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) do
    {:history     => {:testing => testing_history},
     :active_tree => :testing}
  end
  let(:instance_data) { Hash.new }
  let(:props) { {:id => id} }

  describe '#visible?' do
    let(:testing_history) { %w(some thing to test with) }

    %w(1 2 3 4).each do |n|
      context "when with existing history_#{n}" do
        let(:id) { "history_#{n}".to_sym }
        it { expect(subject.visible?).to be_truthy }
      end
    end
    context 'when not history_1 and the tree history not exist' do
      let(:id) { :history_10 }
      it { expect(subject.visible?).to be_falsey }
    end
  end

  describe '#disabled?' do
    context 'when history_item_id == 1' do
      let(:id) { :history_1 }
      (0...2).each do |n|
        context "when x_tree_history.length == #{n}" do
          let(:testing_history) { [*0...n] }
          it { expect(subject.disabled?).to be_truthy }
        end
      end
      (2..4).each do |n|
        context "when x_tree_history.length == #{n}" do
          let(:testing_history) { [*0...n] }
          it { expect(subject.disabled?).to be_falsey }
        end
      end
    end
    context 'when history_item_id != 1' do
      let(:id) { :history_2 }
      let(:testing_history) { [nil] }
      it { expect(subject.disabled?).to be_falsey }
    end
  end
end
