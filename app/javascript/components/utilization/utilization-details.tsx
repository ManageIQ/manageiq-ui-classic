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
        {__('* Information shown is based on available trend data from %{start_time} to %{end_time} in the %{timezone} time zone.')
          .replace('%{start_time}', trendStart)
          .replace('%{end_time}', trendEnd)
          .replace('%{timezone}', timezone)}
      </p>
      <p />
      <br />
    </>
  );
};

export default UtilizationDetails;
