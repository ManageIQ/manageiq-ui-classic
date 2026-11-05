import type { ComponentType } from 'react';

export type ChartDatum = Record<string, unknown>;

// Props shared by every graph component in this directory.
export type ChartGraphProps = {
  data?: ChartDatum[] | null;
  title?: string;
};

export declare const AreaChartGraph: ComponentType<ChartGraphProps>;
export declare const DonutChartGraph: ComponentType<ChartGraphProps>;
export declare const GroupBarChart: ComponentType<ChartGraphProps & { showLegend?: boolean }>;
export declare const GroupHorizontalBarChart: ComponentType<ChartGraphProps>;
export declare const LineChartGraph: ComponentType<ChartGraphProps>;
export declare const PieChartGraph: ComponentType<ChartGraphProps>;
export declare const StackAreaChart: ComponentType<ChartGraphProps>;
export declare const StackBarChartGraph: ComponentType<ChartGraphProps & { chart_options?: Record<string, unknown> | null }>;
export declare const StackHorizontalChart: ComponentType<ChartGraphProps>;
