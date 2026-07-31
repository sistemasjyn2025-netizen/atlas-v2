import React from 'react';
import { usePipelineContext } from '../../contexts/PipelineContext';
import { Loader2, DollarSign, Hammer, Briefcase, Ruler } from 'lucide-react';
import './QuoteSummaryWidget.css';

export const QuoteSummaryWidget: React.FC = () => {
  const { pipelineResult, isCalculating } = usePipelineContext();

  const quote = pipelineResult?.quote;

  // Si no hay cotización aún y no está calculando, no renderizamos nada (o un estado inicial)
  if (!quote && !isCalculating) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 1
    }).format(value);
  };

  // Extraemos datos del BOM si existe (para mostrar el peso total)
  const totalWeightKg = pipelineResult?.bom?.totalEstimatedWeightKg || 0;
  const totalTons = totalWeightKg / 1000;

  return (
    <div className="quote-summary-widget">
      <div className="quote-header">
        <h3 className="atlas-panel-title">Presupuesto Estimado</h3>
        {isCalculating && (
          <div className="quote-status">
            <Loader2 className="pipeline-spinner" size={14} />
            <span>Recalculando...</span>
          </div>
        )}
      </div>

      <div className={`quote-content ${isCalculating ? 'is-loading' : ''}`}>
        {!quote ? (
          <div className="quote-skeleton">
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line" />
          </div>
        ) : (
          <>
            <div className="quote-row highlight">
              <span className="quote-label">
                <DollarSign size={14} /> Total Estimado
              </span>
              <span className="quote-value total">
                {formatCurrency(quote.summary.totalCost)}
              </span>
            </div>

            <div className="quote-divider" />

            <div className="quote-row">
              <span className="quote-label">
                <Ruler size={14} /> Acero ({formatNumber(totalTons)} t)
              </span>
              <span className="quote-value">
                {formatCurrency(quote.summary.totalMaterialCost)}
              </span>
            </div>

            <div className="quote-row">
              <span className="quote-label">
                <Hammer size={14} /> Manufactura y Pintura
              </span>
              <span className="quote-value">
                {formatCurrency(quote.summary.totalOperationCost)}
              </span>
            </div>

            <div className="quote-row">
              <span className="quote-label">
                <Briefcase size={14} /> Ingeniería
              </span>
              <span className="quote-value">
                {formatCurrency(quote.summary.totalLaborCost)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
