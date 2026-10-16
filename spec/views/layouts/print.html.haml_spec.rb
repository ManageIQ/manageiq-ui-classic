describe 'layouts/print.html.haml' do
  before do
    # Stub asset helpers that require the webpack manifest and Sprockets pipeline
    allow(view).to receive(:javascript_dependencies)
    allow(view).to receive(:miq_favicon_link_tag)
    allow(view).to receive(:pdf_page_size_style).and_return('A4')

    assign(:options, :title => 'Test Report', :run_date => '2024-01-01',
                     :page_layout => 'portrait', :page_size => 'us-letter')
  end

  it 'sets the html lang attribute from FastGettext.locale so the JS catalog is activated' do
    FastGettext.with_locale('ja') do
      render :template => 'layouts/print', :layout => false
      expect(rendered).to have_selector('html[lang="ja"]')
    end
  end

  it 'sets the html lang attribute for compound locales (e.g. pt_BR)' do
    FastGettext.with_locale('pt_BR') do
      render :template => 'layouts/print', :layout => false
      expect(rendered).to have_selector('html[lang="pt_BR"]')
    end
  end
end
