shared_context 'ApplicationHelper::Button::Basic' do
  let(:view_context) { setup_view_context_with_sandbox(sandbox) }
  let(:button) { described_class.new(view_context, {}, instance_data, props) }
  subject { button }
end

shared_examples 'ApplicationHelper::Button::Basic visible' do
  it 'is visible' do
    expect(subject.visible?).to be_truthy
  end
end

shared_examples 'ApplicationHelper::Button::Basic hidden' do
  it 'is not visible' do
    expect(subject.visible?).to be_falsey
  end
end

shared_examples 'ApplicationHelper::Button::Basic enabled' do
  it 'is enabled' do
    expect(subject[:enabled]).to be_truthy
    expect(subject[:title]).to be_nil
  end
end

shared_examples 'ApplicationHelper::Button::Basic disabled' do |option|
  it 'is disabled' do
    expect(subject[:enabled]).to be_falsey
    expect(subject[:title]).to eq(option[:error_message])
  end
end

shared_examples 'ApplicationHelper::Button::Basic with correct active context' do |option|
  context "when active_tree == #{option[:tree]} and active_tab == #{option[:tab]}" do
    let(:tree) { option[:tree] }
    let(:tab) { option[:tab] }
    it { expect(subject.visible?).to be_truthy }
  end
end

shared_examples 'ApplicationHelper::Button::Basic with incorrect active context' do |option|
  context "when active_tree == #{option[:tree]} and active_tab == #{option[:tab]}" do
    let(:tree) { option[:tree] }
    let(:tab) { option[:tab] }
    it { expect(subject.visible?).to be_falsey }
  end
end
