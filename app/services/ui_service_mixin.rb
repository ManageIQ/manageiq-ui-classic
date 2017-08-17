module UiServiceMixin
  def icons
    {
      :AvailabilityZone        => {:type => "glyph", :class => 'pficon pficon-zone'},
      :CloudNetwork            => {:type => "glyph", :class => 'ff ff-cloud-network'},
      :CloudSubnet             => {:type => "glyph", :class => 'pficon pficon-network'},
      :CloudTenant             => {:type => "glyph", :class => 'pficon pficon-cloud-tenant'},
      :Container               => {:type => "glyph", :class => 'fa fa-cube'},
      :ContainerGroup          => {:type => "glyph", :class => 'fa fa-cubes'},
      :ContainerNode           => {:type => "glyph", :class => 'pficon pficon-container-node'},
      :ContainerProject        => {:type => "glyph", :class => 'pficon pficon-project'},
      :ContainerReplicator     => {:type => "glyph", :class => 'pficon pficon-replicator'},
      :ContainerRoute          => {:type => "glyph", :class => 'pficon pficon-route'},
      :ContainerService        => {:type => "glyph", :class => 'pficon pficon-service'},
      :EmsCluster              => {:type => "glyph", :class => 'pficon pficon-cluster'},
      :FloatingIp              => {:type => "glyph", :class => 'ff ff-floating-ip'},
      :Host                    => {:type => "glyph", :class => 'pficon pficon-screen'},
      :LoadBalancer            => {:type => "glyph", :class => 'ff ff-load-balancer'},
      :MiddlewareDatasource    => {:type => "glyph", :class => 'fa fa-database'},
      :MiddlewareDeployment    => {:type => "glyph", :class => 'fa fa-file-text-o'},
      :MiddlewareDeploymentEar => {:type => "glyph", :class => 'ff ff-file-ear-o'},
      :MiddlewareDeploymentWar => {:type => "glyph", :class => 'ff ff-file-war-o'},
      :MiddlewareDomain        => {:type => "glyph", :class => 'pficon pficon-domain'},
      :MiddlewareMessaging     => {:type => "glyph", :class => 'fa fa-exchange (placeholder)'},
      :MiddlewareServerGroup   => {:type => "glyph", :class => 'pficon pficon-server-group'},
      :NetworkRouter           => {:type => "glyph", :class => 'pficon pficon-route'},
      :PhysicalServer          => {:type => "glyph", :class => 'pficon pficon-server-group'},
      :SecurityGroup           => {:type => "glyph", :class => 'pficon pficon-cloud-security'},
      :Tag                     => {:type => "glyph", :class => 'fa fa-tag'},
      :Vm                      => {:type => "glyph", :class => 'pficon pficon-virtual-machine'},

      :Amazon                  => {:type => "image", :icon => provider_icon(:Amazon)},
      :Azure                   => {:type => "image", :icon => provider_icon(:Azure)},
      :Google                  => {:type => "image", :icon => provider_icon(:Google)},
      :Kubernetes              => {:type => "image", :icon => provider_icon(:Kubernetes)},
      :Lenovo                  => {:type => "image", :icon => provider_icon(:Lenovo)},
      :Microsoft               => {:type => "image", :icon => provider_icon(:Microsoft)},
      :Nuage                   => {:type => "image", :icon => provider_icon(:Nuage_Network)},
      :Openshift               => {:type => "image", :icon => provider_icon(:Openshift)},
      :Openstack               => {:type => "image", :icon => provider_icon(:Openstack)},
      :Redhat                  => {:type => "image", :icon => provider_icon(:Redhat)},
      :Vmware                  => {:type => "image", :icon => provider_icon(:Vmware)},

      :StatusPaused            => {:type => "image", :icon => ActionController::Base.helpers.image_path("svg/currentstate-paused.svg")},
      :StatusOn                => {:type => "image", :icon => ActionController::Base.helpers.image_path("svg/currentstate-on.svg")}
    }
  end

  def provider_icon(provider_type)
    file_name = "svg/vendor-#{provider_type.to_s.underscore.downcase}.svg"
    ActionController::Base.helpers.image_path(file_name)
  end
end
