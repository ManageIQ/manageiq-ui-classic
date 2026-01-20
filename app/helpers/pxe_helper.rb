module PxeHelper
  include TextualSummary

  def pxe_script_data(data)
    mode = data.type == "CustomizationTemplateKickstart" ? "shell" : "xml"
    rows = [
      row_data('', {:input => 'code_mirror', :props => {:mode => mode, :payload => data.script}})
    ]
    miq_structured_list({
                          :title => _('Script'),
                          :mode  => "script_data",
                          :rows  => rows
                        })
  end

  private

  def row_data(label, value)
    {:cells => {:label => label, :value => value}}
  end
end
