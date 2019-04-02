describe ApplicationController do
  context "#drift_history" do
    it "resets @display to main" do
      vm = FactoryBot.create(:vm_vmware, :name => "My VM")
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
