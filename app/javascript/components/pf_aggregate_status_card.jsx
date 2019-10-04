import React from 'react';
import PropTypes from 'prop-types';

/* eslint react/jsx-one-expression-per-line: "off" */
/* need to keep the spaces before { count } */
const PfAggregateStatusCard = ({
  showTopBorder, altLayout, layout, data,
}) => {
  const shouldShowTopBorder = () => (showTopBorder === true);
  const isAltLayout = () => (altLayout === true || layout === 'tall');
  const isMiniLayout = () => (layout === 'mini');

  const normalLayoutClass = `card-pf card-pf-aggregate-status
    ${isAltLayout() ? ' card-pf-aggregate-status-alt' : ''}
    ${shouldShowTopBorder() ? ' card-pf-accented' : ''}`;

  const notifications = data.notifications || [];

  const renderNormalLayout = () => (
    <div className={normalLayoutClass}>
      <h2 className="card-pf-title">
        <a href={data.href}>
          { data.iconImage && (
            data.largeIcon
              ? <img src={data.iconImage} alt="" width={72} height={72} />
              : <img src={data.iconImage} alt="" className="card-pf-icon-image" />
          )}
          <span className={data.iconClass} />
          <span className="card-pf-aggregate-status-count">{data.count}</span>
          <span className="card-pf-aggregate-status-title">{data.title}</span>
        </a>
      </h2>
      <div className="card-pf-body">
        <p className="card-pf-aggregate-status-notifications">
          { notifications.map(notification => (
            <span key={notification} className="card-pf-aggregate-status-notification">
              <a href={notification.href}>
                { notification.iconImage && (
                  <React.Fragment>
                    <img src={notification.iconImage} alt="" className="card-pf-icon-image" />
                    <span className={notification.iconClass} />
                    <span> { notification.count }</span>
                  </React.Fragment>
                )}
              </a>
            </span>
          ))}
        </p>
      </div>
    </div>
  );

  const displayNotification = () =>
    data.notification && (data.notification.iconImage || data.notification.iconClass || data.notification.count);

  const miniLayoutClass = `card-pf card-pf-aggregate-status card-pf-aggregate-status-mini${shouldShowTopBorder() ? ' card-pf-accented' : ''}`;

  const renderMiniLayout = () => (
    <div className={miniLayoutClass}>
      <h2 className="card-pf-title">
        <a href={data.href}>
          { data.iconImage && <img src={data.iconImage} alt="" className="card-pf-icon-image" /> }
          { data.iconClass && <span className={data.iconClass} /> }
          <span className="card-pf-aggregate-status-count"> {data.count}</span>
          {data.title}
        </a>
      </h2>
      <div className="card-pf-body">
        { displayNotification() && (
          <p className="card-pf-aggregate-status-notifications">
            <span className="card-pf-aggregate-status-notification" title={data.notification.tooltip}>
              { data.notification.href
                ? (
                  <a href={data.notification.href}>
                    { data.notification.iconImage && <img src={data.notification.iconImage} alt="" className="card-pf-icon-image" /> }
                    { data.notification.iconClass && <span className={data.notification.iconClass} /> }
                    { data.notification.count && <span> {data.notification.count}</span> }
                  </a>)
                : (
                  <span>
                    { data.notification.iconImage && <img src={data.notification.iconImage} alt="" className="card-pf-icon-image" /> }
                    { data.notification.iconClass && <span className={data.notification.iconClass} /> }
                    { data.notification.count && <span> {data.notification.count}</span> }
                  </span>
                )
              }
            </span>
          </p>
        )}
      </div>
    </div>
  );

  return isMiniLayout() ? renderMiniLayout() : renderNormalLayout();
};

PfAggregateStatusCard.propTypes = {
  layout: PropTypes.string,
  className: PropTypes.string,
  data: PropTypes.shape({
    iconImage: PropTypes.string,
    iconClass: PropTypes.string,
    largeIcon: PropTypes.bool,
    notifications: PropTypes.arrayOf(PropTypes.any),
    notification: PropTypes.shape({
      iconImage: PropTypes.string,
      iconClass: PropTypes.string,
      count: PropTypes.number,
    }),
  }).isRequired,
  showTopBorder: PropTypes.bool.isRequired,
  altLayout: PropTypes.bool,
};

PfAggregateStatusCard.defaultProps = {
  layout: null,
  className: null,
  data: {},
  altLayout: false,
  showTopBorder: false,
};

export default PfAggregateStatusCard;
