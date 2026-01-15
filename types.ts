
export enum ConversionStatus {
  IDLE = 'IDLE',
  PARSING = 'PARSING',
  RESTRUCTURING = 'RESTRUCTURING',
  CONFIGURING = 'CONFIGURING',
  PACKAGING = 'PACKAGING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface ProjectFile {
  name: string;
  content: string;
}
