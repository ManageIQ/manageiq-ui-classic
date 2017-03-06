describe ApplicationHelper::Button::ContainerTimeline do
  let(:record) { FactoryGirl.create(:container) }
  let(:button) do
    described_class.new(setup_view_context_with_sandbox({}), {}, {'record' => record},
                        {:options => {:entity => 'Container'}})
  end

  it_behaves_like 'a timeline button', :entity => 'Container'
end
