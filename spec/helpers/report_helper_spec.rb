def create_user_with_group(user_id, group_name, role)
  group = FactoryBot.create(:miq_group, :miq_user_role => role, :description => group_name)
  FactoryBot.create(:user, :userid => user_id, :miq_groups => [group])
end

def create_and_generate_report_for_user(report_name, user)
  MiqReport.seed_report(report_name)
  @rpt = MiqReport.where(:name => report_name).last
  @rpt.generate_table(:userid => user.userid)
  report_result = @rpt.build_create_results(:userid => user.userid, :miq_group_id => user.current_group.id)
  report_result.reload
  @rpt
end

describe ReportHelper do
  describe '#chart_fields_options' do
    it 'should return fields with models and aggregate functions from summary when "Show Sort Breaks" is not "No"' do
      @edit = {
        :new => {
          :group       => "Yes",
          :col_options => {"name" => {:break_label => "Cloud/Infrastructure Provider : Name: "}, "mem_cpu" => {:grouping => [:total]}, "allocated_disk_storage" => {:grouping => [:total]}},
          :model       => "Vm",
          :headers     => {"Vm.ext_management_system-name" => "Cloud/Infrastructure Provider Name", "Vm-os_image_name" => "OS Name", "Vm-mem_cpu" => "Memory", "Vm-allocated_disk_storage" => "Allocated Disk Storage"},
          :field_order => [
            ["Cloud/Infrastructure Provider : Name", "Vm.ext_management_system-name"],
            [" OS Name", "Vm-os_image_name"],
            [" Memory", "Vm-mem_cpu"],
            [" Allocated Disk Storage", "Vm-allocated_disk_storage"]
          ]
        }
      }

      options = chart_fields_options
      expected_array = [
        ["Nothing selected", nil],
        ["Memory (Total)", "Vm-mem_cpu:total"],
        ["Allocated Disk Storage (Total)", "Vm-allocated_disk_storage:total"]
      ]

      expect(options).to eq(expected_array)
    end

    it 'should return numeric fields from report with models when "Show Sort Breaks" is "No"' do
      @edit = {
        :new => {
          :group       => "No",
          :model       => "Vm",
          :field_order => [
            ["Cloud/Infrastructure Provider : Name", "Vm.ext_management_system-name"],
            [" OS Name", "Vm-os_image_name"],
            [" Memory", "Vm-mem_cpu"],
            [" Allocated Disk Storage", "Vm-allocated_disk_storage"]
          ]
        }
      }

      options = chart_fields_options

      expected_array = [
        ["Nothing selected", nil],
        [" Memory", "Vm-mem_cpu"],
        [" Allocated Disk Storage", "Vm-allocated_disk_storage"]
      ]

      expect(options).to eq(expected_array)
    end
  end

  describe '#visibility_options' do
    let(:role1) { FactoryBot.create(:miq_user_role, :name => 'EvmRole-auditor') }
    let(:role2) { FactoryBot.create(:miq_user_role, :name => 'EvmRole-desktop') }

    it 'returns "To All Users" when visibility is set to all' do
      widget = FactoryBot.create(:miq_widget, :visibility => {:roles => ['_ALL_']})
      expect(helper.visibility_options(widget)).to eq('To All Users')
    end

    it 'converts role IDs to role names for display' do
      widget = FactoryBot.create(:miq_widget, :visibility => {:roles => [role1.id, role2.id]})
      result = helper.visibility_options(widget)
      expect(result).to include('EvmRole-auditor')
      expect(result).to include('EvmRole-desktop')
      expect(result).to include('By Roles:')
    end

    it 'converts group IDs to group descriptions for display' do
      group1 = FactoryBot.create(:miq_group, :description => 'Group1')
      group2 = FactoryBot.create(:miq_group, :description => 'Group2')
      widget = FactoryBot.create(:miq_widget, :visibility => {:groups => [group1.id, group2.id]})
      result = helper.visibility_options(widget)
      expect(result).to include('Group1')
      expect(result).to include('Group2')
      expect(result).to include('By Groups:')
    end
  end
end
