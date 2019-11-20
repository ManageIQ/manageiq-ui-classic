import React from 'react';

const NavbarHeader = () => (
  <h1>Hello world!</h1>
);

export default NavbarHeader;


/*
  .navbar-header
    %button{:type => "button", :class => "navbar-toggle"}
      %span.sr-only
        = _("Toggle navigation")
      %span.icon-bar
      %span.icon-bar
      %span.icon-bar
    %a.navbar-brand{:href => '/dashboard/start_url', :title => _("Go to my start page")}
      %img.navbar-brand-name{:src => ::Settings.server.custom_brand ? '/upload/custom_brand.png' : image_path("layout/brand.svg"), :alt => "ManageIQ"}
*/
