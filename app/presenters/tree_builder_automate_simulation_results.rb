class TreeBuilderAutomateSimulationResults < TreeBuilder
  include MiqAeClassHelper

  has_kids_for Hash, [:x_get_tree_hash_kids]
  def initialize(name, type, sandbox, build = true, root = nil)
    @root = root
    super(name, type, sandbox, build)
  end

  private

  def tree_init_options(_tree_name)
    {
      :full_ids => true,
      :add_root => false,
      :expand   => true,
      :lazy     => false
    }
  end

  def set_locals_for_render
    locals = super
    locals.merge!(:autoload => false)
  end

  def root_options
    {}
  end

  def x_get_tree_roots(_count_only = false, _options = {})
    objects = []
    xml = MiqXml.load(@root).root
    xml.each_element do |el|
      objects.push(get_root_elements(el, xml.index(el)))
    end
    objects
  end

  def lookup_attrs(el)
    if el.name == "MiqAeObject"
      {
        :text    => t = "#{el.attributes["namespace"]} / #{el.attributes["class"]} / #{el.attributes["instance"]}",
        :tooltip => t,
        :image   => '100/q.png'
      }
    elsif el.name == "MiqAeAttribute"
      {
        :text    => el.attributes["name"],
        :tooltip => el.attributes["name"],
        :image   => '100/attribute.png'
      }
    elsif !el.text.blank?
      {
        :text => el.text,
        :tip  => el.text,
        :icon => ae_field_fonticon(el.name.underscore)
      }
    else
      {
        :text    => el.name,
        :tooltip => el.name,
        :image   => "100/#{el.name.underscore.sub(/^miq_ae_service_/, '')}.png"
      }
    end
  end

  def get_root_elements(el, idx)
    object = {
      :id          => "e_#{idx}",
      :elements    => el.each_element { |e| e },
      :cfmeNoClick => true
    }.merge(lookup_attrs(el))
    object[:attributes] = el.attributes if object[:text] == el.name
    object
  end

  def x_get_tree_hash_kids(parent, count_only)
    kids = []
    if parent[:attributes]
      parent[:attributes].each_with_index do |k, idx|
        object = {
          :id          => "a_#{idx}",
          :icon        => "product product-attribute",
          :cfmeNoClick => true,
          :text        => "#{k.first} = #{k.last}"
        }
        kids.push(object)
      end
    end
    Array(parent[:elements]).each_with_index do |el, i|
      kids.push(get_root_elements(el, i))
    end
    count_only_or_objects(count_only, kids)
  end
end
