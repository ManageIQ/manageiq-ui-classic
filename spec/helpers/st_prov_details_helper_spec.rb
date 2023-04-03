describe StProvDetailsHelper do
  include StProvDetailsHelper

  let(:wf) { FactoryBot.create(:miq_provision_virt_workflow) }
  let(:dialog) do
    FactoryBot.create(:miq_dialog, :name => "vm", :description => "test", :content => {
                        :dialogs => {
                          :customize => {
                            :description => "Customize",
                            :fields      => {
                              :multi_select => {
                                :id      => 1,
                                :visible => true,
                                :label   => 'Select Box',
                                :name    => 'select1',
                                :value   => '1, 2',
                                :type    => 'DialogFieldDropDownList'
                              },
                              :integer      => {
                                :id      => 1,
                                :visible => true,
                                :label   => 'Select Integer',
                                :name    => 'select2',
                                :value   => '100',
                                :type    => 'DialogFieldDropDownList'
                              },
                              :string       => {
                                :id      => 1,
                                :visible => true,
                                :label   => 'Select String',
                                :name    => 'select3',
                                :value   => 'Multiverse of madness',
                                :type    => 'DialogFieldDropDownList'
                              },
                              :none         => {
                                :id      => 1,
                                :visible => true,
                                :label   => 'Select None',
                                :name    => 'select4',
                                :value   => '',
                                :type    => 'DialogFieldDropDownList'
                              }
                            }
                          }
                        }
                      })
  end

  context 'render request dialog details' do
    before do
      wf.dialogs = dialog
    end

    it 'page should display the multi select' do
      field = OpenStruct.new(dialog.content[:dialogs][:customize][:fields][:multi_select])
      response = request_dialog_details(wf, field)
      expect(response[:cells][:label]).to include('Select Box')
      expect(response[:cells][:value]).to include('1, 2')
    end

    it 'page should display the integer value' do
      field = OpenStruct.new(dialog.content[:dialogs][:customize][:fields][:integer])
      response = request_dialog_details(wf, field)
      expect(response[:cells][:label]).to include('Select Integer')
      expect(response[:cells][:value]).to include('100')
    end

    it 'page should display the string value' do
      field = OpenStruct.new(dialog.content[:dialogs][:customize][:fields][:string])
      response = request_dialog_details(wf, field)
      expect(response[:cells][:label]).to include('Select String')
      expect(response[:cells][:value]).to include('Multiverse of madness')
    end

    it 'page should display the blank value as none' do
      field = OpenStruct.new(dialog.content[:dialogs][:customize][:fields][:none])
      response = request_dialog_details(wf, field)
      expect(response[:cells][:label]).to include('Select None')
      expect(response[:cells][:value]).to include('')
    end
  end
end
