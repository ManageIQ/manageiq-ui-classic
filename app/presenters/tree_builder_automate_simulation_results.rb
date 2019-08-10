class TreeBuilderAutomateSimulationResults < TreeBuilder
  include MiqAeClassHelper

  has_kids_for Hash, [:x_get_tree_hash_kids]
  def initialize(name, sandbox, build = true, **params)
    @root = params[:root]
    super(name, sandbox, build)
  end

  private

  def tree_init_options
    {:full_ids => true}
  end

  def x_get_tree_roots(_count_only)
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
        :image   => 'svg/vendor-redhat.svg'
      }
    elsif el.name == "MiqAeAttribute"
      {
        :text    => el.attributes["name"],
        :tooltip => el.attributes["name"],
        :icon    => 'ff ff-attribute'
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
      text = el.text.presence || el.name
      {
        :text => text,
        :tip  => text,
        :icon => ae_field_fonticon(el.name.underscore)
      }
    end
  end

  def get_root_elements(el, idx)
    object = {
      :id         => "e_#{idx}",
      :elements   => el.each_element { |e| e },
      :selectable => false
    }.merge(lookup_attrs(el))
    object[:attributes] = el.attributes if object[:text] == el.name
    object
  end

  def x_get_tree_hash_kids(parent, count_only)
    kids = []
    parent[:attributes]&.each_with_index do |k, idx|
      object = {
        :id         => "a_#{idx}",
        :icon       => "ff ff-attribute",
        :selectable => false,
        :text       => "#{k.first} = #{k.last}"
      }
      kids.push(object)
    end
    Array(parent[:elements]).each_with_index do |el, i|
      kids.push(get_root_elements(el, i))
    end
    count_only_or_objects(count_only, kids)
  end

  def nontreenode_icon(obj)
    case obj
    when Authentication
      'fa fa-lock'
    when CloudResourceQuota
      'fa fa-pie-chart'
    when ContainerVolume
      'pficon pficon-volume'
    when GuestApplication
      'ff ff-software-package'
    when HostAggregate
      'pficon pficon-container-node'
    when MiqRequest
      'fa fa-question'
    when Network
      'pficon pficon-network'
    else
      obj.decorate.fonticon
    end
  end
end
