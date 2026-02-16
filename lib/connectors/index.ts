/**
 * Availability connectors registry
 */

import { ConnectorFactory } from './base';
import { ManualConnector } from './manual';
import { SirvoyConnector } from './sirvoy';

// Register all available connectors
ConnectorFactory.register('manual', ManualConnector);
ConnectorFactory.register('sirvoy', SirvoyConnector);

export { ConnectorFactory };
export * from './base';
export { ManualConnector } from './manual';
export { SirvoyConnector } from './sirvoy';
