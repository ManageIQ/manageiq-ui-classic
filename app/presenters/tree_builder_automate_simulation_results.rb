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
        :icon    => 'product product-attribute'
      }
    elsif el.name.starts_with?('MiqAeService')
      key = el.name.sub(/^MiqAeService/, '').gsub('_', '::')
      base_obj = key.safe_constantize.try(:new)
      obj = TreeNode.new(base_obj) if TreeNode.exists?(base_obj)

      {
        :text    => el.name,
        :tooltip => el.name,
        :icon    => obj ? obj.icon : nontreenode_icon(base_obj),
        :image   => obj ? obj.image : nil
      }
    else
      text = !el.text.blank? ? el.text : el.name
      {
        :text => text,
        :tip  => text,
        :icon => ae_field_fonticon(el.name.underscore)
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

  def nontreenode_icon(obj)
    case obj
    when ArbitrationProfile
      'fa fa-list-ul'
    when Authentication
      'fa fa-lock'
    when CloudResourceQuota
      'fa fa-pie-chart'
    when ContainerVolume
      'pficon pficon-volume'
    when GuestApplication
      'product product-application'
    when HostAggregate
      'pficon pficon-screen'
    when MiqRequest
      'fa fa-question'
    when Network
      'pficon pficon-network'
    else
      obj.decorate.fonticon
    end
  end
end
