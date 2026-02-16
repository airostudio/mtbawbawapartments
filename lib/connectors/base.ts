/**
 * Base connector interface for all availability integrations
 */

export interface DateRange {
  checkIn: Date;
  checkOut: Date;
}

export interface AvailabilityResult {
  available: boolean;
  price?: number; // Base price from the source
  minimumStay?: number;
  error?: string;
}

export interface PropertyConfig {
  propertyId: string;
  connectorType: string;
  connectorConfig: Record<string, any>;
}

/**
 * Base class for all availability connectors
 */
export abstract class BaseConnector {
  protected config: PropertyConfig;

  constructor(config: PropertyConfig) {
    this.config = config;
  }

  /**
   * Check availability for a specific date range
   */
  abstract checkAvailability(dateRange: DateRange): Promise<AvailabilityResult>;

  /**
   * Fetch availability for a calendar period (e.g., next 90 days)
   * Returns a map of date -> availability
   */
  abstract fetchCalendar(startDate: Date, endDate: Date): Promise<Map<string, AvailabilityResult>>;

  /**
   * Validate the connector configuration
   */
  abstract validateConfig(): Promise<boolean>;

  /**
   * Get connector name for logging/debugging
   */
  abstract getName(): string;

  /**
   * Helper to format date as YYYY-MM-DD
   */
  protected formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Helper to calculate nights between dates
   */
  protected calculateNights(checkIn: Date, checkOut: Date): number {
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

/**
 * Factory to create the appropriate connector based on type
 */
export class ConnectorFactory {
  private static connectors: Map<string, typeof BaseConnector> = new Map();

  static register(type: string, connectorClass: typeof BaseConnector) {
    this.connectors.set(type, connectorClass);
  }

  static create(config: PropertyConfig): BaseConnector {
    const ConnectorClass = this.connectors.get(config.connectorType);

    if (!ConnectorClass) {
      throw new Error(`Unknown connector type: ${config.connectorType}`);
    }

    return new ConnectorClass(config);
  }

  static getSupportedTypes(): string[] {
    return Array.from(this.connectors.keys());
  }
}
