describe PhysicalServerHelper::TextualSummary do
  it "#textual_ipv4" do
    network = FactoryGirl.build(:network, :ipaddress => "192.168.1.1")
    guest_device = FactoryGirl.build(:guest_device, :network => network)
    hardware = FactoryGirl.build(:hardware, :guest_devices => [guest_device])
    computer_system = FactoryGirl.build(:computer_system, :hardware => hardware)
    @record = FactoryGirl.build(:physical_server, :computer_system => computer_system)

    result = helper.textual_ipv4
    expect(result[:label]).to eq("IPv4 Address")
    expect(result[:value]).to eq([{:link => "https://192.168.1.1", :external => true, :value => "192.168.1.1"}])

    network.ipaddress = "192.168.1.1,192.168.1.2"
    result = helper.textual_ipv4
    expect(result[:label]).to eq("IPv4 Address")
    expect(result[:value]).to eq(
      [
        {:link => "https://192.168.1.1", :external => true, :value => "192.168.1.1"},
        {:link => "https://192.168.1.2", :external => true, :value => "192.168.1.2"}
      ]
    )

    network.ipaddress = "192.168.1.1, 192.168.1.2"
    result = helper.textual_ipv4
    expect(result[:label]).to eq("IPv4 Address")
    expect(result[:value]).to eq(
      [
        {:link => "https://192.168.1.1", :external => true, :value => "192.168.1.1"},
        {:link => "https://192.168.1.2", :external => true, :value => "192.168.1.2"}
      ]
    )

    network.ipaddress = ""
    result = helper.textual_ipv4
    expect(result[:label]).to eq("IPv4 Address")
    expect(result[:value]).to eq([])
  end
end
