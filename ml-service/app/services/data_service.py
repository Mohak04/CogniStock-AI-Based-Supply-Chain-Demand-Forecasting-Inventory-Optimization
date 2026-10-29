import re
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple
from app.schemas.validation import ValidationResponse, QualityIssue

def detect_frequency_from_dates(dates: pd.Series) -> str:
    """Detects frequency (Daily, Weekly, Monthly) based on median step size."""
    if len(dates) < 2:
        return "Daily"
    clean_dates = pd.to_datetime(dates, errors='coerce').dropna().sort_values().drop_duplicates()
    if len(clean_dates) < 2:
        return "Daily"
    diffs = clean_dates.diff().dt.total_seconds().dropna() / 86400.0
    median_days = float(diffs.median()) if len(diffs) > 0 else 1.0

    if median_days <= 1.5:
        return "Daily"
    elif 1.5 < median_days <= 9.0:
        return "Weekly"
    else:
        return "Monthly"

def validate_and_preprocess_records(
    records: List[Dict[str, Any]],
    mapping: Dict[str, str],
    frequency_override: str = None
) -> ValidationResponse:
    if not records:
        return ValidationResponse(
            isValid=False,
            qualityScore=0.0,
            detectedFrequency="Daily",
            totalRows=0,
            validRows=0,
            invalidRows=0,
            skuCount=0,
            dateRange="No Records",
            passedChecks=[],
            warningsCount=0,
            errorsCount=1,
            validationIssues=[QualityIssue(row=1, field="File", value="Empty", issue="Dataset file contains zero records", severity="High", status="Flagged")],
            detectedColumns=[],
            samplePreviewRows=[]
        )

    df_raw = pd.DataFrame(records)
    detected_columns = list(df_raw.columns)
    sample_preview = records[:5]

    # Required canonical mappings
    date_col = mapping.get("Date")
    sku_col = mapping.get("SKU")
    qty_col = mapping.get("Quantity")

    validation_issues: List[QualityIssue] = []
    passed_checks: List[str] = []

    # Check 1: Required columns presence
    if not date_col or date_col not in df_raw.columns:
        validation_issues.append(
            QualityIssue(row=0, field="Date", value=str(date_col), issue="Required Date column not mapped or missing in source", severity="Critical", status="Blocked")
        )
    else:
        passed_checks.append(f"Required Date column mapped to '{date_col}'")

    if not sku_col or sku_col not in df_raw.columns:
        validation_issues.append(
            QualityIssue(row=0, field="SKU", value=str(sku_col), issue="Required Product/SKU ID column not mapped or missing in source", severity="Critical", status="Blocked")
        )
    else:
        passed_checks.append(f"Required SKU column mapped to '{sku_col}'")

    if not qty_col or qty_col not in df_raw.columns:
        validation_issues.append(
            QualityIssue(row=0, field="Quantity", value=str(qty_col), issue="Required Quantity Sold column not mapped or missing in source", severity="Critical", status="Blocked")
        )
    else:
        passed_checks.append(f"Required Quantity column mapped to '{qty_col}'")

    if not (date_col in df_raw.columns and sku_col in df_raw.columns and qty_col in df_raw.columns):
        return ValidationResponse(
            isValid=False,
            qualityScore=10.0,
            detectedFrequency="Daily",
            totalRows=len(df_raw),
            validRows=0,
            invalidRows=len(df_raw),
            skuCount=0,
            dateRange="Unavailable",
            passedChecks=passed_checks,
            warningsCount=0,
            errorsCount=len(validation_issues),
            validationIssues=validation_issues,
            detectedColumns=detected_columns,
            samplePreviewRows=sample_preview
        )

    total_rows = len(df_raw)
    invalid_row_set = set()

    # Parse Dates
    parsed_dates = pd.to_datetime(df_raw[date_col], errors='coerce')
    invalid_dates = parsed_dates.isna()
    for idx in df_raw[invalid_dates].index[:50]:  # Cap reported issues at 50 to avoid huge payloads
        invalid_row_set.add(idx)
        validation_issues.append(
            QualityIssue(row=int(idx) + 1, field="Date", value=str(df_raw.at[idx, date_col]), issue="Unparseable or non-standard date format", severity="High", status="Flagged")
        )

    if not invalid_dates.any():
        passed_checks.append("All date records conform to ISO / standard datetime format")

    # Parse SKU
    sku_series = df_raw[sku_col].astype(str).str.strip()
    missing_skus = sku_series.isin(["", "nan", "None", "null"])
    for idx in df_raw[missing_skus].index[:50]:
        invalid_row_set.add(idx)
        validation_issues.append(
            QualityIssue(row=int(idx) + 1, field="SKU", value=str(df_raw.at[idx, sku_col]), issue="Missing or empty Product/SKU identifier", severity="High", status="Flagged")
        )

    if not missing_skus.any():
        passed_checks.append("Product/SKU column has zero null or empty identifiers")

    # Parse Quantity
    qty_num = pd.to_numeric(df_raw[qty_col], errors='coerce')
    nan_qty = qty_num.isna()
    for idx in df_raw[nan_qty].index[:50]:
        invalid_row_set.add(idx)
        validation_issues.append(
            QualityIssue(row=int(idx) + 1, field="Quantity", value=str(df_raw.at[idx, qty_col]), issue="Non-numeric quantity value", severity="High", status="Flagged")
        )

    neg_qty = qty_num < 0
    for idx in df_raw[neg_qty].index[:50]:
        invalid_row_set.add(idx)
        validation_issues.append(
            QualityIssue(row=int(idx) + 1, field="Quantity", value=float(df_raw.at[idx, qty_col]), issue="Negative sales quantity detected (returns or invalid entry)", severity="Medium", status="Flagged")
        )

    if not nan_qty.any() and not neg_qty.any():
        passed_checks.append("All sales quantities are non-negative numeric values")

    # Check for duplicate observations for same SKU on same date
    valid_mask = ~(invalid_dates | missing_skus | nan_qty)
    df_valid = df_raw[valid_mask].copy()
    df_valid['__date__'] = parsed_dates[valid_mask]
    df_valid['__sku__'] = sku_series[valid_mask]

    dups = df_valid.duplicated(subset=['__date__', '__sku__'], keep=False)
    dup_count = int(dups.sum())
    if dup_count > 0:
        validation_issues.append(
            QualityIssue(
                row=0,
                field="SKU-Date",
                value=f"{dup_count} duplicate rows",
                issue=f"Found {dup_count} duplicate observations for the same SKU and date. These will be aggregated via summation during forecasting.",
                severity="Low",
                status="Aggregated"
            )
        )
    else:
        passed_checks.append("SKU-date observations are unique per period")

    # Outlier Detection (IQR per SKU)
    valid_qtys = qty_num[valid_mask & ~neg_qty]
    if len(valid_qtys) > 20:
        q25 = valid_qtys.quantile(0.25)
        q75 = valid_qtys.quantile(0.75)
        iqr = q75 - q25
        outlier_threshold = q75 + 3.0 * iqr
        outliers = df_raw[qty_num > outlier_threshold]
        for idx in outliers.index[:20]:
            validation_issues.append(
                QualityIssue(
                    row=int(idx) + 1,
                    field="Quantity",
                    value=float(df_raw.at[idx, qty_col]),
                    issue=f"Statistical demand spike / extreme outlier (> {outlier_threshold:.1f} units). Preserved in dataset without mutation.",
                    severity="Low",
                    status="Flagged"
                )
            )

    # Calculate overall deterministic quality score
    # Score = 100 - penalties
    penalty = 0.0
    penalty += (len(invalid_row_set) / max(1, total_rows)) * 60.0
    if dup_count > 0:
        penalty += min(10.0, (dup_count / total_rows) * 20.0)
    quality_score = max(5.0, round(100.0 - penalty, 1))

    # Detect frequency
    detected_freq = frequency_override or detect_frequency_from_dates(df_raw[date_col])

    # Date range & SKU count
    clean_dates = parsed_dates.dropna().sort_values()
    if len(clean_dates) > 0:
        min_date = clean_dates.iloc[0].strftime('%Y-%m-%d')
        max_date = clean_dates.iloc[-1].strftime('%Y-%m-%d')
        date_range_str = f"{min_date} to {max_date}"
    else:
        date_range_str = "Unavailable"

    sku_count = int(sku_series.nunique())

    errors_count = sum(1 for i in validation_issues if i.severity in ["Critical", "High"])
    warnings_count = sum(1 for i in validation_issues if i.severity in ["Medium", "Low"])

    is_valid = errors_count == 0 or (len(invalid_row_set) / total_rows < 0.20)

    return ValidationResponse(
        isValid=is_valid,
        qualityScore=quality_score,
        detectedFrequency=detected_freq,
        totalRows=total_rows,
        validRows=total_rows - len(invalid_row_set),
        invalidRows=len(invalid_row_set),
        skuCount=sku_count,
        dateRange=date_range_str,
        passedChecks=passed_checks,
        warningsCount=warnings_count,
        errorsCount=errors_count,
        validationIssues=validation_issues,
        detectedColumns=detected_columns,
        samplePreviewRows=sample_preview
    )
