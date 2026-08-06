import { describe, it, expect } from 'vitest';
import { ReportingService } from '../services/reporting.service';
import { DeepAnalysisService } from '../services/deep-analysis.service';
import { MonitoringService } from '../services/monitoring.service';
import { MevAdvancedService } from '../services/mev-advanced.service';

describe('Kallipolis ZK Advanced Enterprise Modules Test Suite', () => {
  it('should generate threat intelligence reports with IPFS hash & signature', () => {
    const report = ReportingService.generateReport(1000, 15, 5);
    expect(report.reportId).toBeDefined();
    expect(report.totalTransactionsScanned).toBe(1000);
    expect(report.ipfsHash).toMatch(/^Qm[a-f0-9]{44}$/);
    expect(report.signature).toMatch(/^0x[a-f0-9]{64}$/);

    const json = ReportingService.exportReportToJson(report);
    expect(json).toContain('reportId');
  });

  it('should analyze smart contracts for vulnerabilities accurately', () => {
    const resUnsafe = DeepAnalysisService.analyzeContract('0x123', 'f2f20000abc');
    expect(resUnsafe.securityScore).toBeLessThan(80);
    expect(resUnsafe.vulnerabilities.length).toBeGreaterThan(0);
    expect(resUnsafe.isSafeForAggLayer).toBe(false);

    const resSafe = DeepAnalysisService.analyzeContract('0x456', '608060405234801561001057600080fd5b50');
    expect(resSafe.securityScore).toBe(100);
    expect(resSafe.isSafeForAggLayer).toBe(true);
  });

  it('should broadcast and subscribe to real-time monitoring events', () => {
    let receivedEvent: any = null;
    const unsubscribe = MonitoringService.subscribe((ev) => {
      receivedEvent = ev;
    });

    MonitoringService.emitEvent('MEV_DETECTED', 'CRITICAL', 'Sandwich attack blocked');
    expect(receivedEvent).not.toBeNull();
    expect(receivedEvent.eventType).toBe('MEV_DETECTED');
    expect(receivedEvent.severity).toBe('CRITICAL');

    unsubscribe();
  });

  it('should detect advanced MEV patterns and sandwich vectors', () => {
    const patterns = MevAdvancedService.detectAdvancedMev(['0x123', '0x456', '0x789']);
    expect(patterns.length).toBeGreaterThan(0);
    expect(patterns[0].patternId).toBe('MEV-ADV-01');
    expect(patterns[0].estimatedProfitEth).toContain('ETH');
  });
});
