describe ApplicationHelper::Button::SvcCatalogProvision do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:record) { FactoryGirl.create(:service_template, :resource_actions => resource_actions) }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, {}) }

  describe '#calculate_properties' do
    before { button.calculate_properties }

    context 'when there is an Ordering Dialog available' do
      let(:dialog) { FactoryGirl.create(:dialog) }
      let(:resource_actions) { [FactoryGirl.create(:resource_action, :action => 'Provision', :dialog_id => dialog.id)] }
      it_behaves_like 'an enabled button'
    end
    context 'when there is no Ordering Dialog available' do
      let(:resource_actions) { [FactoryGirl.create(:resource_action, :action => 'OtherAction')] }
      it_behaves_like 'a disabled button', 'No Ordering Dialog is available'
    end
  end
end
