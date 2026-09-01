interface SummaryRow {
  id: string;
  item: string;
  value: string;
}

export interface SummarySection {
  key: string;
  label: string;
  rows: SummaryRow[];
}

export interface SummaryData {
  cpu?: string[][];
  memory?: string[][];
  storage?: string[][];
}

export interface ReportData extends SummaryData {
  info?: string[][];
}

export interface SummaryProps {
  hasTrendData: boolean;
  summary?: string | SummaryData | null;
  model?: string | null;
  trendStart?: string;
  trendEnd?: string;
  timezone?: string;
  noNodeSelected?: boolean;
}

export interface DetailsProps {
  hasTrendData: boolean;
  trendStart?: string;
  trendEnd?: string;
  timezone?: string;
  noNodeSelected?: boolean;
}

export interface ReportProps {
  hasTrendData: boolean;
  summary?: string | ReportData | null;
  trendStart?: string;
  trendEnd?: string;
  timezone?: string;
  noNodeSelected?: boolean;
}
