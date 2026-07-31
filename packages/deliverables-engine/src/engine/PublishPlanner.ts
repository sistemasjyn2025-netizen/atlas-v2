import { PublishConfiguration } from '../domain/PublishConfiguration';
import { IDeliverableExporter } from '../exporters/IDeliverableExporter';
import { BomCsvExporter } from '../exporters/BomCsvExporter';
import { CostExecutiveSummaryExporter } from '../exporters/CostExecutiveSummaryExporter';
import { DescriptiveReportExporter } from '../exporters/DescriptiveReportExporter';
import { PdfReportExporter } from '../exporters/PdfReportExporter';
export class PublishPlanner {
  public planExporters(config: PublishConfiguration): IDeliverableExporter[] {
    const exporters: IDeliverableExporter[] = [];

    if (config.includeBom) {
      exporters.push(new BomCsvExporter());
    }
    
    if (config.includeCostSummary) {
      exporters.push(new CostExecutiveSummaryExporter());
    }

    if (config.includeExecutiveReport) {
      exporters.push(new PdfReportExporter());
    }

    if (config.includeDescriptiveReport) {
      exporters.push(new DescriptiveReportExporter());
    }

    // PDF and DXF not fully implemented yet, but planner is ready for them
    
    return exporters;
  }
}
