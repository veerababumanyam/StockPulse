import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useTelemetry, SpanContext } from './TelemetryContext';

// Define the compliance level
export type ComplianceLevel = 'high' | 'medium' | 'low' | 'unknown';

// Define the data lineage record
export interface DataLineageRecord {
  id: string;
  timestamp: string;
  source: string;
  operation: string;
  inputs: string[];
  outputs: string[];
  model: string;
  user: string;
  tags: string[];
}

// Define the audit record
export interface AuditRecord {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  resource: string;
  outcome: 'success' | 'failure';
  details: string;
  severity: 'info' | 'warning' | 'critical';
  tags: string[];
}

// Define the compliance check
export interface ComplianceCheck {
  id: string;
  name: string;
  description: string;
  category: 'data_privacy' | 'financial_regulation' | 'security' | 'ethics' | 'operational';
  status: 'passed' | 'failed' | 'warning' | 'not_applicable';
  lastChecked: string;
  details: string;
  remediation?: string;
}

// Define the governance context interface
interface GovernanceContextType {
  // Data lineage
  recordLineage: (record: Omit<DataLineageRecord, 'id' | 'timestamp'>) => string;
  getLineageById: (id: string) => DataLineageRecord | null;
  getLineageByOutput: (outputId: string) => DataLineageRecord[];
  getLineageByInput: (inputId: string) => DataLineageRecord[];
  
  // Audit trails
  recordAudit: (record: Omit<AuditRecord, 'id' | 'timestamp'>) => string;
  getAuditById: (id: string) => AuditRecord | null;
  getAuditsByActor: (actor: string) => AuditRecord[];
  getAuditsByResource: (resource: string) => AuditRecord[];
  getAuditsByTimeRange: (start: string, end: string) => AuditRecord[];
  
  // Compliance checks
  runComplianceCheck: (checkId: string) => Promise<ComplianceCheck>;
  runAllComplianceChecks: () => Promise<ComplianceCheck[]>;
  getComplianceStatus: () => { level: ComplianceLevel, checks: ComplianceCheck[] };
  
  // Governance settings
  isGovernanceEnabled: boolean;
  setGovernanceEnabled: (enabled: boolean) => void;
  complianceLevel: ComplianceLevel;
  setComplianceLevel: (level: ComplianceLevel) => void;
}

// Create the context with default values
const GovernanceContext = createContext<GovernanceContextType>({
  // Data lineage
  recordLineage: () => '',
  getLineageById: () => null,
  getLineageByOutput: () => [],
  getLineageByInput: () => [],
  
  // Audit trails
  recordAudit: () => '',
  getAuditById: () => null,
  getAuditsByActor: () => [],
  getAuditsByResource: () => [],
  getAuditsByTimeRange: () => [],
  
  // Compliance checks
  runComplianceCheck: async () => ({
    id: '',
    name: '',
    description: '',
    category: 'operational',
    status: 'not_applicable',
    lastChecked: '',
    details: ''
  }),
  runAllComplianceChecks: async () => [],
  getComplianceStatus: () => ({ level: 'unknown', checks: [] }),
  
  // Governance settings
  isGovernanceEnabled: false,
  setGovernanceEnabled: () => {},
  complianceLevel: 'medium',
  setComplianceLevel: () => {},
});

// Generate a random ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Provider component
export const GovernanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isGovernanceEnabled, setGovernanceEnabled] = useState<boolean>(true);
  const [complianceLevel, setComplianceLevel] = useState<ComplianceLevel>('medium');
  const [dataLineage, setDataLineage] = useState<Record<string, DataLineageRecord>>({});
  const [auditTrail, setAuditTrail] = useState<Record<string, AuditRecord>>({});
  const [complianceChecks, setComplianceChecks] = useState<Record<string, ComplianceCheck>>({});
  const telemetry = useTelemetry();

  // Initialize with some sample compliance checks
  useEffect(() => {
    const initialChecks: Record<string, ComplianceCheck> = {
      'data-privacy-1': {
        id: 'data-privacy-1',
        name: 'PII Data Handling',
        description: 'Checks if personally identifiable information is properly handled',
        category: 'data_privacy',
        status: 'passed',
        lastChecked: new Date().toISOString(),
        details: 'No PII data detected in recent operations',
      },
      'financial-reg-1': {
        id: 'financial-reg-1',
        name: 'Financial Advice Disclaimer',
        description: 'Verifies that financial advice includes proper disclaimers',
        category: 'financial_regulation',
        status: 'passed',
        lastChecked: new Date().toISOString(),
        details: 'All financial advice includes required disclaimers',
      },
      'security-1': {
        id: 'security-1',
        name: 'MCP Connection Security',
        description: 'Validates that all MCP connections use secure protocols',
        category: 'security',
        status: 'passed',
        lastChecked: new Date().toISOString(),
        details: 'All MCP connections use TLS 1.3',
      },
      'ethics-1': {
        id: 'ethics-1',
        name: 'Bias Detection',
        description: 'Monitors for potential bias in AI model outputs',
        category: 'ethics',
        status: 'warning',
        lastChecked: new Date().toISOString(),
        details: 'Potential minor bias detected in sentiment analysis',
        remediation: 'Review sentiment analysis training data and algorithms',
      },
      'operational-1': {
        id: 'operational-1',
        name: 'Data Retention Policy',
        description: 'Ensures data is retained according to policy',
        category: 'operational',
        status: 'passed',
        lastChecked: new Date().toISOString(),
        details: 'All data retention policies are being followed',
      },
    };
    
    setComplianceChecks(initialChecks);
  }, []);

  // Record a data lineage entry
  const recordLineage = (record: Omit<DataLineageRecord, 'id' | 'timestamp'>): string => {
    if (!isGovernanceEnabled) return '';
    
    const span = telemetry.startSpan('governance.record_lineage', {
      'governance.lineage.source': record.source,
      'governance.lineage.operation': record.operation,
    });
    
    const id = generateId();
    const timestamp = new Date().toISOString();
    
    const lineageRecord: DataLineageRecord = {
      ...record,
      id,
      timestamp,
    };
    
    setDataLineage(prev => ({
      ...prev,
      [id]: lineageRecord
    }));
    
    telemetry.addEvent(span, 'governance.lineage_recorded', {
      'governance.lineage.id': id,
      'governance.lineage.model': record.model,
    });
    
    telemetry.endSpan(span);
    
    return id;
  };
  
  // Get a lineage record by ID
  const getLineageById = (id: string): DataLineageRecord | null => {
    return dataLineage[id] || null;
  };
  
  // Get lineage records by output
  const getLineageByOutput = (outputId: string): DataLineageRecord[] => {
    return Object.values(dataLineage).filter(record => 
      record.outputs.includes(outputId)
    );
  };
  
  // Get lineage records by input
  const getLineageByInput = (inputId: string): DataLineageRecord[] => {
    return Object.values(dataLineage).filter(record => 
      record.inputs.includes(inputId)
    );
  };
  
  // Record an audit entry
  const recordAudit = (record: Omit<AuditRecord, 'id' | 'timestamp'>): string => {
    if (!isGovernanceEnabled) return '';
    
    const span = telemetry.startSpan('governance.record_audit', {
      'governance.audit.actor': record.actor,
      'governance.audit.action': record.action,
      'governance.audit.resource': record.resource,
    });
    
    const id = generateId();
    const timestamp = new Date().toISOString();
    
    const auditRecord: AuditRecord = {
      ...record,
      id,
      timestamp,
    };
    
    setAuditTrail(prev => ({
      ...prev,
      [id]: auditRecord
    }));
    
    telemetry.addEvent(span, 'governance.audit_recorded', {
      'governance.audit.id': id,
      'governance.audit.outcome': record.outcome,
      'governance.audit.severity': record.severity,
    });
    
    telemetry.endSpan(span);
    
    return id;
  };
  
  // Get an audit record by ID
  const getAuditById = (id: string): AuditRecord | null => {
    return auditTrail[id] || null;
  };
  
  // Get audit records by actor
  const getAuditsByActor = (actor: string): AuditRecord[] => {
    return Object.values(auditTrail).filter(record => 
      record.actor === actor
    );
  };
  
  // Get audit records by resource
  const getAuditsByResource = (resource: string): AuditRecord[] => {
    return Object.values(auditTrail).filter(record => 
      record.resource === resource
    );
  };
  
  // Get audit records by time range
  const getAuditsByTimeRange = (start: string, end: string): AuditRecord[] => {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    
    return Object.values(auditTrail).filter(record => {
      const recordTime = new Date(record.timestamp).getTime();
      return recordTime >= startTime && recordTime <= endTime;
    });
  };
  
  // Run a specific compliance check
  const runComplianceCheck = async (checkId: string): Promise<ComplianceCheck> => {
    if (!isGovernanceEnabled) {
      return {
        id: checkId,
        name: 'Governance Disabled',
        description: 'Governance features are currently disabled',
        category: 'operational',
        status: 'not_applicable',
        lastChecked: new Date().toISOString(),
        details: 'Enable governance to run compliance checks',
      };
    }
    
    const span = telemetry.startSpan('governance.compliance_check', {
      'governance.compliance.check_id': checkId,
    });
    
    // Check if this check exists
    const existingCheck = complianceChecks[checkId];
    if (!existingCheck) {
      telemetry.addEvent(span, 'governance.compliance_check_not_found', {
        'governance.compliance.check_id': checkId,
      });
      
      telemetry.endSpan(span);
      
      return {
        id: checkId,
        name: 'Unknown Check',
        description: 'The requested compliance check does not exist',
        category: 'operational',
        status: 'not_applicable',
        lastChecked: new Date().toISOString(),
        details: `Check ID ${checkId} not found`,
      };
    }
    
    // In a real implementation, this would perform the actual check
    // For now, we'll simulate a check with a random outcome
    const random = Math.random();
    let status: 'passed' | 'failed' | 'warning' | 'not_applicable';
    let details: string;
    
    if (random > 0.9) {
      status = 'failed';
      details = `Compliance check failed: ${existingCheck.description}`;
    } else if (random > 0.7) {
      status = 'warning';
      details = `Compliance check warning: ${existingCheck.description}`;
    } else {
      status = 'passed';
      details = `Compliance check passed: ${existingCheck.description}`;
    }
    
    const updatedCheck: ComplianceCheck = {
      ...existingCheck,
      status,
      details,
      lastChecked: new Date().toISOString(),
    };
    
    setComplianceChecks(prev => ({
      ...prev,
      [checkId]: updatedCheck
    }));
    
    telemetry.addEvent(span, 'governance.compliance_check_completed', {
      'governance.compliance.check_id': checkId,
      'governance.compliance.status': status,
    });
    
    telemetry.endSpan(span);
    
    return updatedCheck;
  };
  
  // Run all compliance checks
  const runAllComplianceChecks = async (): Promise<ComplianceCheck[]> => {
    if (!isGovernanceEnabled) {
      return [];
    }
    
    const span = telemetry.startSpan('governance.run_all_compliance_checks', {
      'governance.compliance.check_count': Object.keys(complianceChecks).length,
    });
    
    const results: ComplianceCheck[] = [];
    
    for (const checkId of Object.keys(complianceChecks)) {
      const result = await runComplianceCheck(checkId);
      results.push(result);
    }
    
    telemetry.addEvent(span, 'governance.all_compliance_checks_completed', {
      'governance.compliance.passed_count': results.filter(r => r.status === 'passed').length,
      'governance.compliance.failed_count': results.filter(r => r.status === 'failed').length,
      'governance.compliance.warning_count': results.filter(r => r.status === 'warning').length,
    });
    
    telemetry.endSpan(span);
    
    return results;
  };
  
  // Get overall compliance status
  const getComplianceStatus = (): { level: ComplianceLevel, checks: ComplianceCheck[] } => {
    if (!isGovernanceEnabled) {
      return { level: 'unknown', checks: [] };
    }
    
    const checks = Object.values(complianceChecks);
    
    // Determine compliance level based on check results
    const failedChecks = checks.filter(check => check.status === 'failed').length;
    const warningChecks = checks.filter(check => check.status === 'warning').length;
    const totalChecks = checks.length;
    
    let level: ComplianceLevel;
    
    if (failedChecks > 0) {
      level = 'low';
    } else if (warningChecks > totalChecks * 0.2) {
      level = 'medium';
    } else {
      level = 'high';
    }
    
    return { level, checks };
  };

  return (
    <GovernanceContext.Provider
      value={{
        // Data lineage
        recordLineage,
        getLineageById,
        getLineageByOutput,
        getLineageByInput,
        
        // Audit trails
        recordAudit,
        getAuditById,
        getAuditsByActor,
        getAuditsByResource,
        getAuditsByTimeRange,
        
        // Compliance checks
        runComplianceCheck,
        runAllComplianceChecks,
        getComplianceStatus,
        
        // Governance settings
        isGovernanceEnabled,
        setGovernanceEnabled,
        complianceLevel,
        setComplianceLevel,
      }}
    >
      {children}
    </GovernanceContext.Provider>
  );
};

// Custom hook to use the governance context
export const useGovernance = () => useContext(GovernanceContext);

// Higher-order component to wrap a component with governance
export const withGovernance = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  const WithGovernance: React.FC<P> = (props) => {
    return (
      <GovernanceProvider>
        <Component {...props} />
      </GovernanceProvider>
    );
  };

  return WithGovernance;
};
