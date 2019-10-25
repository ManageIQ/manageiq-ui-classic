describe MiqTemplateController do
  it 'returns proper record class' do
    expect(controller.send(:record_class)).to eq(MiqTemplate)
  end
end
