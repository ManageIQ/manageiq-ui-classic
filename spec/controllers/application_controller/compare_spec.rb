describe ApplicationController do
  context "#drift_history" do
    it "resets @display to main" do
      vm = FactoryGirl.create(:vm_vmware, :name => "My VM")
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

  # view = MiqCompare originally
  # section = Hash[:name => :_model_]
  # fields = [{:name => :name, :header => "Name"},
  #           {:name => 'hosts.size', :header => 'Number of hosts'},
  #           {:name => 'vms.size', :header => 'Number of vms'}
  # ]
  # view.ids = [1,2]
  # view.results = {1 => {:_model_ => {:name => {:_value_ => "Cluster1"}, :"hosts.size" => {:_value_ => 1}, :"vms_size" => {:_value_ => 1} } },
  #                 2 => {:_model_ => {:name => {:_value_ => "Cluster2"}, :"hosts.size" => {:_value_ => 1}, :"vms_size" => {:_value_ => 1} } }
  # }
  class self::TestView
    attr_accessor :ids, :results
    def initialize
      @ids = []
      @results = []
    end
  end

  let(:view) { self.class::TestView.new }

  context "#compare_cluster_fields" do
    let(:section) { {:name => :_model_} }
    let(:fields) { {} }

    let(:sample_values) do
      # name of fields has to be same
      {
        1 => [{:name => :field1, :value => 1},
              {:name => :field2, :value => 20},
              {:name => :field3, :value => 30},
              {:name => :field4, :value => 40},
              {:name => :field5, :value => 'string 1'},
              {:name => :field6, :value => 'string 2'}],

        2 => [{:name => :field1, :value => 10},
              {:name => :field2, :value => 20},
              {:name => :field3, :value => 'xx'},
              {:name => :field4, :value => nil},
              {:name => :field5, :value => 'string 1'},
              {:name => :field6, :value => 'other string'}]
      }
    end

    before(:each) do
      controller.instance_variable_set(:@compressed, false)
      controller.instance_variable_set(:@exists_mode, false)

      view.ids = [1, 2]
      view.results = {}
      @fields = []
      init_fields_and_results(sample_values)

    end
    # simulation of fields param
    def fill_fields(rows)
      rows.each do |row|
        @fields << { :name => row[:name], :header => row[:name] }
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

    def init_fields_and_results(clusters)
      fill_fields(clusters[1])

      fill_view_results(clusters)
    end

    def get_same_and_diff_totals
      totals = {}
      totals[:diff_fields_count] = 0
      totals[:same_fields_count] = 0

      @fields.each do |field|

        # Get reference value from first cluster
        ref_value = sample_values[1].select do |row|
          row[:name] == field[:name]
        end

        next if ref_value.blank?
        ref_value = ref_value.first[:value]

        # Compare with same field in all clusters
        same = true
        sample_values.each_value do |cluster_values|
          cluster_values.each do |cluster_value|
            if cluster_value[:name] == field[:name]
              same = false if cluster_value[:value] != ref_value
            end
          end
        end
        if same
          totals[:same_fields_count] += 1
        else
          totals[:diff_fields_count] += 1
        end
      end

      totals
    end


    it "sets total fields in section with 'All attributes' button to number of fields" do
      controller.instance_variable_set(:@sb, {:miq_temp_params => 'all'})

      all_fields_count = sample_values[1].size

      expect(controller.send(:comp_section_fields_total, view, section, @fields)).to eq(all_fields_count)
    end

    it "sets total fields in section with 'Attributes with different values' button to number of fields where clusters differs" do
      controller.instance_variable_set(:@sb, {:miq_temp_params => 'different'})

      diff_fields_count = get_same_and_diff_totals[:diff_fields_count]
      expect(controller.send(:comp_section_fields_total, view, section, @fields)).to eq(diff_fields_count)

    end

    it "sets total fields in section with 'Attributes with same values' button to number of fields with same values among clusters" do
      controller.instance_variable_set(:@sb, :miq_temp_params => 'same')

      same_fields_count = get_same_and_diff_totals[:same_fields_count]
      expect(controller.send(:comp_section_fields_total, view, section, @fields)).to eq(same_fields_count)
    end
  end
end
