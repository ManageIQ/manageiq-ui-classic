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
