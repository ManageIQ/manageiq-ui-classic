describe 'layouts/_compare.html.haml' do
  before { set_controller_for_view("storage") }

  it 'renders Cancel button' do
    render :partial => 'layouts/compare'
    expect(response).to include('<a class="btn btn-default" alt="Cancel" title="Cancel" rel="nofollow" data-method="post" href="/storage/compare_cancel">Cancel</a>')
  end
end
