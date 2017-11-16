module ApplicationHelper
  module Discover
    DTYPES = {
      'azure'           => _('Azure'),
      'ec2'             => _('Amazon'),
      'esx'             => _('ESX'),
      'hyperv'          => _('Hyper-V'),
      'ipmi'            => _('IPMI'),
      'kvm'             => _('KVM'),
      'lenovo_ph_infra' => _('Lenovo XClarity Administrator'),
      'msvirtualserver' => _('MS vCenter'),
      'openstack_infra' => _('OpenStack Infrastructure'),
      'rhevm'           => _('Red Hat Virtualization'),
      'scvmm'           => _('Microsoft System Center VMM'),
      'virtualcenter'   => _('VMware vCenter'),
      'vmwareserver'    => _('VMware Server')
    }.freeze

    def discover_type(dtype)
      if dtypes.key?(dtype)
        dtypes[dtype]
      else
        dtype.titleize
      end
    end

    def dtypes
      DTYPES
    end
  end
end
