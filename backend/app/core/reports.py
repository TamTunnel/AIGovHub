"""
PDF Compliance Report Generator.
Generates EU AI Act style compliance reports for registered models.
"""
from io import BytesIO
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.enums import TA_CENTER, TA_LEFT

from ..models import ModelRegistry, ModelVersion, EvaluationMetric, ComplianceLog


def generate_compliance_report(
    model: ModelRegistry,
    versions: list[ModelVersion],
    metrics: list[EvaluationMetric],
    logs: list[ComplianceLog]
) -> BytesIO:
    """
    Generate a PDF compliance report for a given model.
    Returns a BytesIO buffer containing the PDF.
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#1a365d')
    )
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        spaceBefore=20,
        spaceAfter=10,
        textColor=colors.HexColor('#2c5282')
    )
    normal_style = styles['Normal']
    
    elements = []
    
    # --- Title ---
    elements.append(Paragraph("AI Model Compliance Report", title_style))
    elements.append(Paragraph(f"EU AI Act Documentation", styles['Heading3']))
    elements.append(Spacer(1, 20))
    
    # --- Model Information ---
    elements.append(Paragraph("1. Model Information", heading_style))
    model_data = [
        ["Field", "Value"],
        ["Model ID", str(model.id)],
        ["Model Name", model.name],
        ["Owner", model.owner],
        ["Description", model.description or "N/A"],
        ["Registration Date", model.created_at.strftime("%Y-%m-%d %H:%M UTC")],
        ["Report Generated", datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")],
    ]
    model_table = Table(model_data, colWidths=[2*inch, 4*inch])
    model_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e2e8f0')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#1a365d')),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(model_table)
    elements.append(Spacer(1, 20))
    
    # --- Version History ---
    elements.append(Paragraph("2. Version History", heading_style))
    if versions:
        version_data = [["Version", "Artifact Path", "Created"]]
        for v in versions:
            version_data.append([
                v.version_tag,
                v.s3_path or "N/A",
                v.created_at.strftime("%Y-%m-%d")
            ])
        version_table = Table(version_data, colWidths=[1.5*inch, 3*inch, 1.5*inch])
        version_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e2e8f0')),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ]))
        elements.append(version_table)
    else:
        elements.append(Paragraph("No versions registered.", normal_style))
    elements.append(Spacer(1, 20))
    
    # --- Evaluation Metrics ---
    elements.append(Paragraph("3. Evaluation Metrics", heading_style))
    if metrics:
        metric_data = [["Metric", "Value", "Recorded"]]
        for m in metrics:
            metric_data.append([
                m.metric_name,
                f"{m.value:.4f}",
                m.timestamp.strftime("%Y-%m-%d")
            ])
        metric_table = Table(metric_data, colWidths=[2*inch, 2*inch, 2*inch])
        metric_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e2e8f0')),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ]))
        elements.append(metric_table)
    else:
        elements.append(Paragraph("No evaluation metrics recorded.", normal_style))
    elements.append(Spacer(1, 20))
    
    # --- Audit Trail ---
    elements.append(Paragraph("4. Compliance Audit Trail", heading_style))
    if logs:
        log_data = [["Action", "Entity", "Timestamp"]]
        for log in logs[:10]:  # Last 10 entries
            log_data.append([
                log.action,
                f"{log.entity_type} #{log.entity_id}",
                log.timestamp.strftime("%Y-%m-%d %H:%M")
            ])
        log_table = Table(log_data, colWidths=[1.5*inch, 2.5*inch, 2*inch])
        log_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e2e8f0')),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ]))
        elements.append(log_table)
    else:
        elements.append(Paragraph("No audit logs available.", normal_style))
    elements.append(Spacer(1, 30))
    
    # --- Disclaimer ---
    elements.append(Paragraph("5. Compliance Declaration", heading_style))
    disclaimer = """
    This report is generated automatically by the AI Model Governance Hub. 
    It provides a summary of model registration, versioning, and evaluation data 
    for compliance documentation purposes. This report should be reviewed by 
    appropriate personnel before submission to regulatory bodies.
    """
    elements.append(Paragraph(disclaimer, normal_style))
    
    # Build PDF
    doc.build(elements)
    buffer.seek(0)
    return buffer
