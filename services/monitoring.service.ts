/**
 * Kallipolis ZK Real-Time Monitoring & Telemetry Service
 * Manages WebSocket feeds, metrics streaming, and alert dispatching.
 */

export interface TelemetryStreamEvent {
  eventId: string;
  timestamp: number;
  eventType: 'MEMPOOL_TX' | 'MEV_DETECTED' | 'BRIDGE_ANOMALY' | 'ZK_PROOF_VERIFIED';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  details: string;
}

export class MonitoringService {
  private static subscribers: ((event: TelemetryStreamEvent) => void)[] = [];

  /**
   * Registers a telemetry subscriber.
   */
  public static subscribe(callback: (event: TelemetryStreamEvent) => void): () => void {
    MonitoringService.subscribers.push(callback);
    return () => {
      MonitoringService.subscribers = MonitoringService.subscribers.filter(sub => sub !== callback);
    };
  }

  /**
   * Emits a real-time event to all subscribers.
   */
  public static emitEvent(eventType: TelemetryStreamEvent['eventType'], severity: TelemetryStreamEvent['severity'], details: string): TelemetryStreamEvent {
    const event: TelemetryStreamEvent = {
      eventId: `tel-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now(),
      eventType,
      severity,
      details
    };

    MonitoringService.subscribers.forEach(sub => sub(event));
    return event;
  }
}
