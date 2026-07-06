from app.scoring.scales import SCALES
from app.scoring.statements import get_scale_items
from app.scoring.norms import NORMS, K_CORRECTION


def raw_scores(answers):
    scores = {}
    for scale in SCALES:
        code = scale["code"]
        items = get_scale_items(code)
        count = 0
        for item in items:
            given = answers.get(item["id"])
            if given is None:
                continue
            if given == item["key"]:
                count += 1
        scores[code] = count
    return scores


def apply_k_correction(scores):
    k = scores.get("K", 0)
    corrected = dict(scores)
    for code, fraction in K_CORRECTION.items():
        corrected[code] = round(scores[code] + fraction * k)
    return corrected


def raw_to_t(scores, gender):
    norms = NORMS.get(gender, NORMS["m"])
    profile = {}
    for code, raw in scores.items():
        mean, sd = norms[code]
        t = 50 + 10 * (raw - mean) / sd
        profile[code] = max(0, round(t))
    return profile


def check_validity(profile):
    if profile["L"] >= 70 or profile["F"] >= 80 or profile["K"] >= 75:
        return "doubtful"
    return "valid"


def compute_result(answers, gender):
    raw = raw_scores(answers)
    corrected = apply_k_correction(raw)
    profile = raw_to_t(corrected, gender)
    validity = check_validity(profile)
    return {"raw": corrected, "profile": profile, "validity": validity}
