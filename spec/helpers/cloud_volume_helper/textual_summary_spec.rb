fdescribe CloudVolumeHelper::TextualSummary do
  include ApplicationHelper

  let(:ems) do
    FactoryBot.create(:physical_infra,)
  end

  let(:cloud_volume) do
    FactoryBot.create(:cloud_volume, :ems_id => ems.id, :name => "my_volume", :size => 10)
  end

  let(:role) { FactoryBot.create(:miq_user_role, :name => "EvmRole-super_administrator") }
  let(:group) { FactoryBot.create(:miq_group, :miq_user_role => role) }
  let(:user) { FactoryBot.create(:user, :miq_groups => [group]) }

  before do
    login_as user
    @record = cloud_volume
  end

  it "Equals expected result" do
    pp process_textual_info textual_group_list, @record
    expect(
        process_textual_info textual_group_list, @record
    ).to eq(
             [[{:title => "Properties",
                :component => "GenericGroup",
                :items =>
                    [{:label => "Name", :value => "my_volume", :hoverClass => "no-hover"},
                     {:value => "10 Bytes", :label => "Size", :hoverClass => "no-hover"},
                     {:label => "Description", :value => nil, :hoverClass => "no-hover"}]},
               {:title => "Relationships",
                :component => "GenericGroup",
                :items =>
                    [{:label => "Physical Infrastructure Provider",
                      :value => ems.name,
                      :icon => nil,
                      :image => "/images/svg/vendor-lenovo_ph_infra.svg",
                      :hoverClass => "no-hover"},
                     {:value => "None",
                      :label => "Availability Zone",
                      :icon => "pficon pficon-zone",
                      :hoverClass => "no-hover"},
                     {:value => "None",
                      :label => "Cloud Tenants",
                      :icon => "pficon pficon-cloud-tenant",
                      :hoverClass => "no-hover"},
                     {:value => 0,
                      :label => "Cloud Volume Backups",
                      :icon => "pficon pficon-volume",
                      :hoverClass => "no-hover"},
                     {:value => 0,
                      :label => "Cloud Volume Snapshots",
                      :icon => "fa fa-camera",
                      :hoverClass => "no-hover"},
                     {:value => 0,
                      :label => "Instances",
                      :icon => "pficon pficon-virtual-machine",
                      :hoverClass => "no-hover"}]}],
              [{:title => "Smart Management",
                :component => "TagGroup",
                :items =>
                    [{:label => " Tags",
                      :icon => "fa fa-tag",
                      :value => "No  Tags have been assigned",
                      :hoverClass => "no-hover"}]}]]

         )
  end

end

