import React from 'react';
import * as icons from '@carbon/react/icons';

type CarbonizeIconOptionsType = {
  size?: number;
  className?: string;
};

// Props that Carbon components pass to icon render functions (SVG props)
type CarbonIconProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
};

type HtmlIconProps = React.HTMLAttributes<HTMLElement>;

export const carbonizeIcon = (
  classname?: string,
  options?: CarbonizeIconOptionsType
) => {
  const size = options?.size || 20; // Default size is 20px

  if (!classname) {
    return null;
  }

  if (!classname.startsWith('carbon--')) {
    return (props: HtmlIconProps) => <i className={classname} {...props} />;
  }

  const name = classname.replace(/^carbon--/, '');
  const IconComponent = icons[
    name as keyof typeof icons
  ] as React.ComponentType<CarbonIconProps>;

  if (options?.className) {
    return (props: CarbonIconProps) => (
      <div className={`${options.className}-div`}>
        <IconComponent className={options.className} size={size} {...props} />
      </div>
    );
  }

  return (props: CarbonIconProps) => <IconComponent size={size} {...props} />;
};

type MiqIconProps = {
  icon: string;
  size?: number;
};

const MiqIcon: React.FC<MiqIconProps> = ({ icon, size = 16 }) => {
  const IconElement = carbonizeIcon(icon, { size });
  return IconElement ? <IconElement style={{ marginBottom: '-4px' }} /> : null;
};

export default MiqIcon;
