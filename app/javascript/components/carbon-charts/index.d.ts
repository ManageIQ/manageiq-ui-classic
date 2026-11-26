import type { ComponentType } from 'react';
import type { GenericDataType } from '@@miq-types/common';

export type ChartDatum = GenericDataType;

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
export declare const StackBarChartGraph: ComponentType<ChartGraphProps & { chart_options?: GenericDataType | null }>;
export declare const StackHorizontalChart: ComponentType<ChartGraphProps>;
