describe 'layouts/_x_edit_buttons.html.haml' do
  context 'policy simulation' do
    let(:record) { FactoryBot.create(:vm_infra) }

    before { assign(:record, record) }

    it 'renders Back button with proper onclick' do
      render :partial => 'layouts/x_edit_buttons',
             :locals  => {:record_id => record.id,
                          :params    => {:action => 'policies'}}
      expect(response).to include('title="Back" onclick="miqAjaxButton(&#39;/vm_infra/policy_sim?continue=true&#39;);">')
    end
  end
end
