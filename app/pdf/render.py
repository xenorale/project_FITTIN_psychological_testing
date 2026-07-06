import os

from weasyprint import HTML

from app.scoring.scales import SCALES

TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), "template.html")


def build_scale_rows(profile, raw):
    rows = ""
    for s in SCALES:
        code = s["code"]
        t = profile.get(code, "")
        r = raw.get(code, "")
        css_class = "peak" if isinstance(t, int) and t >= 70 else ""
        rows += "<tr><td>{code}</td><td>{name}</td><td>{raw}</td><td class='{cls}'>{t}</td></tr>".format(
            code=code, name=s["name"], raw=r, t=t, cls=css_class
        )
    return rows


def build_interpretation_block(interpretation):
    if not interpretation:
        return "<div class='muted'>Выраженных пиков (T &gt; 70) в профиле нет.</div>"

    block = ""
    for item in interpretation:
        block += (
            "<div class='interp'><b>{code} &middot; {name}</b> (T = {t})<br>{text}</div>".format(
                code=item["code"], name=item["name"], t=item["t"], text=item["text"]
            )
        )
    return block


def render_candidate_pdf(candidate_out) -> bytes:
    with open(TEMPLATE_PATH, "r", encoding="utf-8") as f:
        html = f.read()

    validity_class = "valid" if candidate_out.validity == "valid" else "doubtful"
    validity_label = "Профиль достоверен" if candidate_out.validity == "valid" else "Достоверность под вопросом"

    html = html.replace("__NAME__", candidate_out.name)
    html = html.replace("__POSITION__", candidate_out.position)
    html = html.replace("__EMAIL__", candidate_out.email)
    html = html.replace("__VALIDITY_CLASS__", validity_class)
    html = html.replace("__VALIDITY_LABEL__", validity_label)
    html = html.replace("__SCALE_ROWS__", build_scale_rows(candidate_out.profile, candidate_out.raw))
    html = html.replace("__INTERPRETATION_BLOCK__", build_interpretation_block(candidate_out.interpretation))

    return HTML(string=html).write_pdf()
