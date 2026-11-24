import io
from datetime import datetime
from typing import Optional

try:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    _HAS_REPORTLAB = True
except ImportError:
    _HAS_REPORTLAB = False


def generate_invoice_pdf_bytes(
    invoice_number: str,
    student_name: str,
    student_email: str,
    item_title: str,
    method: str,
    sender_number: str,
    transaction_id: str,
    amount: float,
    status: str,
    created_at_str: str,
    company_name: str = "Learn With Maruf Ahmed",
) -> bytes:
    if not _HAS_REPORTLAB:
        content = (
            f"OFFICIAL INVOICE - {company_name}\n"
            f"Invoice: {invoice_number}\n"
            f"Student: {student_name} ({student_email})\n"
            f"Course / Item: {item_title}\n"
            f"Method: {method} | Sender: {sender_number}\n"
            f"TrxID: {transaction_id}\n"
            f"Amount: BDT {amount:,.2f}\n"
            f"Status: {status}\n"
            f"Date: {created_at_str}\n"
        )
        return content.encode("utf-8")

    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "InvoiceTitle",
        parent=styles["Heading1"],
        fontSize=20,
        textColor=colors.HexColor("#0284C7"),
        spaceAfter=6,
    )
    sub_style = ParagraphStyle(
        "InvoiceSub",
        parent=styles["Normal"],
        fontSize=10,
        textColor=colors.HexColor("#475569"),
        spaceAfter=20,
    )

    elements = [
        Paragraph(company_name, title_style),
        Paragraph(f"Official Payment Receipt & Enrollment Invoice • {invoice_number}", sub_style),
    ]

    data = [
        ["Field", "Details"],
        ["Invoice ID", invoice_number],
        ["Student Name", student_name],
        ["Student Email", student_email],
        ["Enrolled Item", item_title],
        ["Payment Gateway / Method", method],
        ["Sender Account", sender_number],
        ["Transaction ID (TrxID)", transaction_id],
        ["Total Paid (BDT)", f"BDT {amount:,.2f}"],
        ["Verification Status", status.upper()],
        ["Issued Date", created_at_str],
    ]

    table = Table(data, colWidths=[160, 340])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0F172A")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
                ("TOPPADDING", (0, 0), (-1, -1), 9),
                ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#F8FAFC")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ]
        )
    )
    elements.append(table)
    elements.append(Spacer(1, 24))
    elements.append(
        Paragraph(
            "Verified digitally by Learn With Maruf Ahmed Cloud LMS 2.0. Keep this invoice for your records.",
            sub_style,
        )
    )
    doc.build(elements)
    return buf.getvalue()


def generate_lesson_notes_pdf_bytes(
    course_title: str,
    lesson_title: str,
    student_name: str,
    note_content: str,
) -> bytes:
    if not _HAS_REPORTLAB:
        return f"Course: {course_title}\nLesson: {lesson_title}\nStudent: {student_name}\n\n{note_content}".encode("utf-8")

    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, rightMargin=45, leftMargin=45, topMargin=45, bottomMargin=45)
    styles = getSampleStyleSheet()
    elements = [
        Paragraph(f"Smart Study Notes — {course_title}", styles["Heading2"]),
        Paragraph(f"Lesson: {lesson_title} | Learner: {student_name}", styles["Italic"]),
        Spacer(1, 16),
    ]
    for line in note_content.splitlines() or ["(No notes recorded)"]:
        safe_line = (
            line.replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
        )
        elements.append(Paragraph(safe_line or "&nbsp;", styles["Normal"]))
        elements.append(Spacer(1, 6))

    doc.build(elements)
    return buf.getvalue()
