require ManageIQ::UI::Classic::Engine.root.join("spec/helpers/report_helper_spec.rb")

describe ApplicationController do
  describe "#drift_history" do
    it "resets @display to main" do
      vm = FactoryBot.create(:vm_vmware)
      controller.instance_variable_set(:@display, "vms")
      controller.instance_variable_set(:@sb, {})
      controller.instance_variable_set(:@drift_obj, vm)
      allow(controller).to receive(:identify_obj)
      allow(controller).to receive(:drift_state_timestamps)
      allow(controller).to receive(:drop_breadcrumb)
      expect(controller).to receive(:render)
      controller.send(:drift_history)
      expect(assigns(:display)).to eq("main")
    end
  end

  describe '#compare_cancel' do
    let(:prev_breadcrumb) { {:name => "some name", :url => "some url"} }

    before { controller.instance_variable_set(:@breadcrumbs, [{}, prev_breadcrumb, {}]) }

    it 'calls javascript_prologue and redirect_to' do
      expect(controller).to receive(:javascript_prologue)
      expect(controller).to receive(:redirect_to).with(prev_breadcrumb[:url])
      controller.send(:compare_cancel)
    end
  end

  describe "compare_to_pdf" do
    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
    end

    let(:compare) do
      first_vm = FactoryBot.create(:vm)
      second_vm = FactoryBot.create(:vm)
      report = FactoryBot.create(:miq_report, :col_order => [])

      FactoryBot.build(
        :miq_compare,
        :report  => report,
        :options => {
          :ids     => [first_vm.id, second_vm.id],
          :include => {
            :hardware            => {:fetch => false, :fetched => false, :checked => false, :group => "Properties"},
            :_model_             => {:fetch => true,  :fetched => false, :checked => true,  :group => "Properties"},
            :"hardware.disks"    => {:fetch => false, :fetched => false, :checked => false, :key => "", :group => "Properties"},
            :"hardware.cdroms"   => {:fetch => false, :fetched => false, :checked => false, :key => "", :group => "Properties"},
            :"hardware.floppies" => {:fetch => false, :fetched => false, :checked => false, :key => "", :group => "Properties"},
            :"hardware.nics"     => {:fetch => false, :fetched => false, :checked => false, :key => "", :group => "Properties"},
            :"hardware.volumes"  => {:fetch => false, :fetched => false, :checked => false, :key => :name, :group => "Properties"}
          }
        }
      )
    end

    it 'builds the compare report and renders it' do
      session[:miq_compare] = Marshal.dump(compare)
      controller.instance_variable_set(:@sb, :compare_db => 'Vm')

      expect(controller).to receive(:create_compare_report).and_call_original
      expect(controller).to receive(:render_pdf_internal).and_call_original
      expect(controller).to receive(:report_print_options).and_call_original
      expect(controller).to receive(:render)

      controller.send(:compare_to_pdf)
    end
  end

  describe "download_data" do
    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
    end

    # http://lucifer.usersys.redhat.com:3000/container_build/download_data?download_type=pdf#/
    it 'builds a report from the GTL data' do
      user = create_user_with_group('User2', "Group1", MiqUserRole.find_by(:name => "EvmRole-operator"))
      report = create_and_generate_report_for_user("Vendor and Guest OS", user)

      session[:view] = report
      session[:paged_view_search_options] = {}
      controller.params = {:download_type => 'pdf'}

      expect(controller).to receive(:render).with(
        hash_including(
          :template => '/layouts/print/report',
          :layout   => '/layouts/print',
          :locals   => hash_including(
            :report # the report does not match due to a ".dup" call in the controller.
          )
        )
      )

      controller.send(:download_data)
    end
  end
end

describe EmsClusterController do
  let(:compare_ids) { [1, 2] }
  let(:drift_ids) { [1.day.ago, 2.days.ago] }

  # view = MiqCompare originally
  # section = Hash[:name => :_model_]
  # fields = [{:name => :name, :header => "Name"},
  #           {:name => 'hosts.size', :header => 'Number of hosts'},
  #           {:name => 'vms.size', :header => 'Number of vms'}
  # ]
  # view.ids: [Time, Time] for drifts
  # view.ids = [1,2] for compares
  #
  # view.results = {view.ids[0] => {:_model_ => {:name => {:_value_ => "Cluster1"}, :"hosts.size" => {:_value_ => 1}, :"vms_size" => {:_value_ => 1} } },
  #                 view.ids[1] => {:_model_ => {:name => {:_value_ => "Cluster2"}, :"hosts.size" => {:_value_ => 1}, :"vms_size" => {:_value_ => 1} } }
  # }
  class self::TestView
    attr_accessor :ids, :results

    def initialize
      @ids = []
      @results = []
    end
  end

  let(:view) { self.class::TestView.new }

  let(:section) { {:name => :_model_} }

  let(:values1) do
    [{:name => :field1, :value => 1},
     {:name => :field2, :value => 20},
     {:name => :field3, :value => 30},
     {:name => :field4, :value => 40},
     {:name => :field5, :value => 'string 1'},
     {:name => :field6, :value => 'string 2'}]
  end

  let(:values2) do
    [{:name => :field1, :value => 10},
     {:name => :field2, :value => 20},
     {:name => :field3, :value => 'xx'},
     {:name => :field4, :value => nil},
     {:name => :field5, :value => 'string 1'},
     {:name => :field6, :value => 'other string'}]
  end

  before do
    controller.instance_variable_set(:@compressed, false)
    controller.instance_variable_set(:@exists_mode, false)
  end

  # simulation of fields param
  def fill_fields(rows)
    rows.each do |row|
      @fields << {:name => row[:name], :header => row[:name]}
    end
  end

  # simulation of view.results param
  def fill_view_results(clusters)
    clusters.each_pair do |id, rows|
      view.results[id] ||= {:_model_ => {:name => {:_value_ => "Cluster#{id}"}}}

      rows.each do |row|
        view.results[id][:_model_][row[:name].to_sym] = {:_value_ => row[:value]}
      end
    end
  end

  def init_sample_values(ids)
    @sample_values = {
      ids[0] => values1,
      ids[1] => values2
    }
  end

  def init_fields_and_results(clusters)
    fill_fields(clusters[view.ids[0]])

    fill_view_results(clusters)
  end

  context 'compares' do
    before do
      view.ids = compare_ids

      @sample_values = {}
      init_sample_values(view.ids)

      view.results = {}
      @fields = []
      init_fields_and_results(@sample_values)
    end

    it "sets total fields in section with 'All attributes' button to number of fields" do
      controller.instance_variable_set(:@sb, :miq_temp_params => 'all')

      all_fields_count = @sample_values[view.ids[0]].size

      expect(controller.send(:comp_section_fields_total, view, section, @fields)).to eq(all_fields_count)
    end

    it "sets total fields in section with 'Attributes with different values' button to number of fields where clusters differs" do
      controller.instance_variable_set(:@sb, :miq_temp_params => 'different')

      diff_fields_count = 4 # differences in sample_values
      expect(controller.send(:comp_section_fields_total, view, section, @fields)).to eq(diff_fields_count)
    end

    it "sets total fields in section with 'Attributes with same values' button to number of fields with same values among clusters" do
      controller.instance_variable_set(:@sb, :miq_temp_params => 'same')

      same_fields_count = 2 # same values in sample_values
      expect(controller.send(:comp_section_fields_total, view, section, @fields)).to eq(same_fields_count)
    end

    it "returns row without error" do
      controller.instance_variable_set(:@sb, :miq_temp_params => 'same')
      controller.instance_variable_set(:@exists_mode, true)
      row = controller.send(:comp_record_data_compressed, 1, nil, nil, true)
      expect(row).to eq(:col2=> '<div class=""><i class="compare-diff" title="Missing"></i></div>')
    end

    it "sets session[:selected_sections] to empty array when last section on screen is unchecked" do
      session[:selected_sections] = [:_model_]
      controller.params = {:id => "xx-group_Properties_xx-group_Properties%253A_model_", :check => "false"}
      allow(controller).to receive(:render)
      controller.send(:sections_field_changed)
      expect(session[:selected_sections]).to eq([])
    end

    it "sets selected sections in session[:selected_sections]" do
      session[:selected_sections] = [:_model_]
      controller.params = {:all_checked => ["xx-group_Properties_xx-group_Properties:_model_", "xx-group_Properties_xx-group_Properties:hardware"], :id => "xx-group_Properties_xx-group_Properties%253Ahardware", :check => "true"}
      allow(controller).to receive(:render)
      controller.send(:sections_field_changed)
      expect(session[:selected_sections]).to eq(["_model_", "hardware"])
    end

    context 'changes in Comparison Sections' do
      before do
        allow(controller).to receive(:render)
        allow(controller).to receive(:session).and_return(:db_title => 'VMs')
        controller.instance_variable_set(:@display, 'instances')
        controller.params = {:check => 'true'}
      end

      it 'sets @explorer to false' do
        controller.send(:sections_field_changed)
        expect(controller.instance_variable_get(:@explorer)).to be(false)
      end

      it 'calls set_checked_sections according to the params' do
        expect(controller).to receive(:set_checked_sections)
        controller.send(:sections_field_changed)
      end

      context 'explorer screen' do
        before { controller.instance_variable_set(:@display, nil) }

        it 'sets @explorer to true' do
          controller.send(:sections_field_changed)
          expect(controller.instance_variable_get(:@explorer)).to be(true)
        end
      end
    end
  end

  context 'drifts' do
    before do
      view.ids = drift_ids

      @sample_values = {}
      init_sample_values(view.ids)

      view.results = {}
      @fields = []
      init_fields_and_results(@sample_values)
    end

    it "sets total fields in section with 'All attributes' button to number of fields" do
      controller.instance_variable_set(:@sb, :miq_drift_params => 'all')

      all_fields_count = @sample_values[view.ids[0]].size

      expect(controller.send(:drift_section_fields_total, view, section, @fields)).to eq(all_fields_count)
    end

    it "sets total fields in section with 'Attributes with different values' button to number of fields where clusters differs" do
      controller.instance_variable_set(:@sb, :miq_drift_params => 'different')

      diff_fields_count = 4 # differences in sample_values
      expect(controller.send(:drift_section_fields_total, view, section, @fields)).to eq(diff_fields_count)
    end

    it "sets total fields in section with 'Attributes with same values' button to number of fields with same values among clusters" do
      controller.instance_variable_set(:@sb, :miq_drift_params => 'same')

      same_fields_count = 2 # same values in sample_values
      expect(controller.send(:drift_section_fields_total, view, section, @fields)).to eq(same_fields_count)
    end
  end
end
