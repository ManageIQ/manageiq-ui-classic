# rubocop:disable  Style/OpenStructUse
describe 'miq_request/_request_dialog_details.html.haml' do
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
                                :value   => 100,
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
      render :partial => 'miq_request/request_dialog_details', :locals => {:wf => wf, :field => field}
      expect(response.body).to include('Select Box')
      expect(response.body).to include('1, 2')
    end

    it 'page should display the integer value' do
      field = OpenStruct.new(dialog.content[:dialogs][:customize][:fields][:integer])
      render :partial => 'miq_request/request_dialog_details', :locals => {:wf => wf, :field => field}
      expect(response.body).to include('Select Integer')
      expect(response.body).to include('100')
    end

    it 'page should display the string value' do
      field = OpenStruct.new(dialog.content[:dialogs][:customize][:fields][:string])
      render :partial => 'miq_request/request_dialog_details', :locals => {:wf => wf, :field => field}
      expect(response.body).to include('Select String')
      expect(response.body).to include('Multiverse of madness')
    end

    it 'page should display the blank value as none' do
      field = OpenStruct.new(dialog.content[:dialogs][:customize][:fields][:none])
      render :partial => 'miq_request/request_dialog_details', :locals => {:wf => wf, :field => field}
      expect(response.body).to include('Select None')
      expect(response.body).to include('&lt;None&gt;')
    end
  end
end
# rubocop:enable  Style/OpenStructUse
