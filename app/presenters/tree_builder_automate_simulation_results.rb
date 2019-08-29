class TreeBuilderAutomateSimulationResults < TreeBuilder
  include MiqAeClassHelper

  has_kids_for REXML::Element, %i[x_get_tree_rexml_element_kids]

  def initialize(name, sandbox, build = true, **params)
    @root = params[:root]
    super(name, sandbox, build)
  end

  private

  def tree_init_options
    {:full_ids => true}
  end

  def x_get_tree_roots
    xml_children(MiqXml.load(@root).root)
  end

  def x_get_tree_rexml_element_kids(object, _count_only)
    objects = []
    object.attributes.each_attribute { |attr| objects.push(attr) }

    objects + xml_children(object)
  end

  def xml_children(xml)
    objects = []
    xml.each_element do |el|
      objects.push(el)
    end
    objects
  end
end
