from io import BytesIO

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Spacer, Table, TableStyle, Paragraph

from app.db import get_supabase

router = APIRouter(prefix="/projects/{project_id}/exports", tags=["exports"])


@router.get("/boq.pdf")
def export_boq_pdf(project_id: str):
    client = get_supabase()
    project_result = (
        client.table("projects")
        .select("id,name,location,client_name,currency")
        .eq("id", project_id)
        .limit(1)
        .execute()
    )
    if not project_result.data:
        raise HTTPException(status_code=404, detail="Project not found")

    project = project_result.data[0]
    items = (
        client.table("boq_items")
        .select("item_no,description,unit,quantity,unit_rate,amount,section_id")
        .eq("project_id", project_id)
        .order("item_no")
        .execute()
    ).data
    sections = (
        client.table("boq_sections")
        .select("id,name")
        .eq("project_id", project_id)
        .order("sort_order")
        .execute()
    ).data
    section_names = {str(s["id"]): s["name"] for s in sections}

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=15 * mm,
        leftMargin=15 * mm,
        topMargin=15 * mm,
        bottomMargin=15 * mm,
    )
    styles = getSampleStyleSheet()
    story = [
        Paragraph("BILL OF QUANTITIES", styles["Title"]),
        Spacer(1, 5 * mm),
        Paragraph(f"<b>Project:</b> {project['name']}", styles["Normal"]),
        Paragraph(f"<b>Location:</b> {project.get('location') or ''}", styles["Normal"]),
        Paragraph(f"<b>Client:</b> {project.get('client_name') or ''}", styles["Normal"]),
        Spacer(1, 5 * mm),
    ]

    currency = project.get("currency") or "ETB"
    data = [["Item", "Description", "Unit", "Qty", "Unit Rate", "Amount", "Section"]]
    total = 0.0
    for item in items:
        amount = float(item["amount"])
        total += amount
        section_id = str(item["section_id"]) if item.get("section_id") else None
        data.append([
            str(item["item_no"]),
            str(item["description"]),
            str(item["unit"]),
            f"{float(item['quantity']):,.2f}",
            f"{float(item['unit_rate']):,.2f}",
            f"{amount:,.2f}",
            section_names.get(section_id, "Unassigned"),
        ])

    data.append(["", "", "", "", "DIRECT COST", f"{total:,.2f} {currency}", ""])
    table = Table(data, repeatRows=1, colWidths=[12*mm, 58*mm, 15*mm, 18*mm, 24*mm, 27*mm, 31*mm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1f2937")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.grey),
        ("ALIGN", (3, 1), (5, -1), "RIGHT"),
        ("FONTNAME", (4, -1), (5, -1), "Helvetica-Bold"),
        ("BACKGROUND", (4, -1), (5, -1), colors.HexColor("#e5e7eb")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("FONTSIZE", (0, 0), (-1, -1), 7.5),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(table)
    doc.build(story)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="boq-{project_id}.pdf"'},
    )
