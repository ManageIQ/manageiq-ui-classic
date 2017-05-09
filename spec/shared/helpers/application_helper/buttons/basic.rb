shared_context 'ApplicationHelper::Button::Basic' do
  let(:view_context) { setup_view_context_with_sandbox(sandbox) }
  let(:button) { described_class.new(view_context, {}, instance_data, props) }
  subject { button }
end

shared_examples 'ApplicationHelper::Button::Basic#visible?' do |visible|
  it "is #{visible ? '' : 'not '}visible" do
    expect(subject.visible?).to visible ? be_truthy : be_falsey
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
