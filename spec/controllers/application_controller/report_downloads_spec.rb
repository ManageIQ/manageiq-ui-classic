describe ApplicationController do
  context "report downloads" do
    describe "set_summary_pdf_data" do
      before do
        hw = FactoryGirl.create(:hardware, :cpu_sockets => 2, :cpu_cores_per_socket => 4, :cpu_total_cores => 8)
        @template = FactoryGirl.create(:vm_or_template, :hardware => hw)
        controller.instance_variable_set(:@record, @template)
        controller.instance_variable_set(:@display, "download_pdf")
        allow(controller).to receive(:disable_client_cache).and_return(nil)
        allow(controller).to receive(:send_data).and_return(nil)
        allow(PdfGenerator).to receive(:pdf_from_string).and_return("")
      end

      it "returns 200" do
        controller.send(:set_summary_pdf_data)
        expect(response).to have_http_status 200
      end
    end
  end
end
