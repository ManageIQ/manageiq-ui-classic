import { InlineNotification } from '@carbon/react';
import type { DetailsProps } from './utilization-types';

const UtilizationDetails = ({
  hasTrendData,
  trendStart = '',
  trendEnd = '',
  timezone = '',
  noNodeSelected = false,
}: DetailsProps) => {
  if (!hasTrendData) {
    const message = noNodeSelected
      ? __('Select a node on the left to view Utilization information.')
      : __('No performance data is available for the selected item.');

    return (
      <InlineNotification
        kind="info"
        title={message}
        lowContrast
        hideCloseButton
      />
    );
  }

  return (
    <>
      <br />
      <hr />
      <p>
        {sprintf(
          __('* Information shown is based on available trend data from %s to %s in the %s time zone.'),
          trendStart,
          trendEnd,
          timezone,
        )}
      </p>
      <p />
      <br />
    </>
  );
};

export default UtilizationDetails;
