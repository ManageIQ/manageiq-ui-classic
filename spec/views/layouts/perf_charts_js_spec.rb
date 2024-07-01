describe 'layouts/_perf_chart_js.html.haml' do
  context "has correct structure for chart interactivity" do
    helper(ChartingHelper)
    let(:chart_data)  { [{:data => {}, :main_col => column, :menu => menu, :zoom_url => zoom_url}] }
    let(:chart_data2) { [{:data => {}, :data2 => {}, :main_col => column, :menu => menu, :zoom_url => zoom_url}] }
    let(:charts)      { [{:title => "CPU (Mhz)", :type => "Line", :columns => [column], :menu => menu, :applies_to_method => "cpu_mhz_available?"}] }
    let(:column)      { "cpu_usagemhz_rate_average" }
    let(:menu)        { ["Chart-Current-Daily:Back to daily", "Timeline-Current-Hourly:Hourly events on this VM"] }
    let(:zoom_url)    { "javascript:miqAsyncAjax('/vm_infra/perf_chart_chooser/10000000000011?chart_idx=0')" }

    it 'with simple chart' do
      render :partial => '/layouts/perf_chart_js', :locals => {:chart_data => chart_data, :chart_index => 0, :chart_set => 'candu', :charts => charts}
      expect(response).to include("<ul aria-labelledby='miq_chart_candu_0' class='dropdown-menu' id='miq_chartmenu_candu_0' role='menu' style='position: fixed;'></ul>")
    end

    it 'with composite chart' do
      render :partial => '/layouts/perf_chart_js', :locals => {:chart_data => chart_data2, :chart_index => 0, :chart_set => 'candu', :charts => charts}
      expect(response).to include("<ul aria-labelledby='miq_chart_candu_0' class='dropdown-menu' id='miq_chartmenu_candu_0' role='menu' style='position:fixed;'></ul>")
      expect(response).to include("<ul aria-labelledby='miq_chart_candu_0_2' class='dropdown-menu' id='miq_chartmenu_candu_0_2' role='menu' style='position: fixed;'></ul>")
    end
  end
end
