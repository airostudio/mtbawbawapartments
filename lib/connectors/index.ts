/**
 * Availability connectors registry
 */

import { ConnectorFactory } from './base';
import { ManualConnector } from './manual';
import { SirvoyConnector } from './sirvoy';
import { BookingComConnector } from './booking-com';
import { AirbnbConnector } from './airbnb';

// Register all available connectors
ConnectorFactory.register('manual', ManualConnector);
ConnectorFactory.register('sirvoy', SirvoyConnector);
ConnectorFactory.register('booking_com', BookingComConnector);
ConnectorFactory.register('airbnb', AirbnbConnector);

export { ConnectorFactory };
export * from './base';
export { ManualConnector } from './manual';
export { SirvoyConnector } from './sirvoy';
export { BookingComConnector } from './booking-com';
export { AirbnbConnector } from './airbnb';
export { ICalBaseConnector } from './ical-base';
