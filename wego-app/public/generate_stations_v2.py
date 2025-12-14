import json, math
from bs4 import BeautifulSoup

# 입력 및 출력 경로 설정
SVG_PATH = "Subway.svg"           # ⚙️ 같은 폴더에 Subway.svg 파일이 있어야 함
OUTPUT_PATH = "stations_v2.json"  # 결과 JSON

# 거리 계산 함수
def distance(p1, p2):
    return math.hypot(p1[0] - p2[0], p1[1] - p2[1])

def parse_points(el):
    """path 또는 polyline 좌표를 추출"""
    points = []
    if el.name == "polyline" and el.get("points"):
        for p in el["points"].strip().split():
            if "," in p:
                try:
                    x, y = map(float, p.split(","))
                    points.append((x, y))
                except:
                    pass
    elif el.name == "path" and el.get("d"):
        nums = []
        for n in el["d"].replace(",", " ").split():
            try:
                nums.append(float(n))
            except:
                pass
        # 짝수 단위로 좌표로 변환
        for i in range(0, len(nums)-1, 2):
            points.append((nums[i], nums[i+1]))
    return points

def main():
    print("🔍 Subway.svg 분석 중...")
    with open(SVG_PATH, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "xml")

    # 1️⃣ 노선 경로 좌표 수집
    line_paths = []
    for el in soup.find_all(["path", "polyline"]):
        line_name = el.get("data-line") or el.find_parent(attrs={"data-line": True})
        if not line_name:
            continue
        if hasattr(line_name, "get"):
            line_name = line_name.get("data-line")
        points = parse_points(el)
        if points:
            line_paths.append({"name": line_name, "points": points})
    print(f"✅ 노선 경로 {len(line_paths)}개 수집 완료")

    # 2️⃣ 역 정보 수집
    stations = []
    for t in soup.find_all("text"):
        name = t.get_text(strip=True)
        if not name or len(name) < 2:
            continue
        # transform(matrix) 좌표 계산
        x = y = None
        tr = t.get("transform")
        if tr and "matrix" in tr:
            try:
                parts = tr.split("(")[1].split(")")[0].replace(",", " ").split()
                x = float(parts[4])
                y = float(parts[5])
            except:
                continue
        if x is None or y is None:
            continue

        # 3️⃣ 근접 노선 탐색
        nearby = set()
        for path in line_paths:
            for px, py in path["points"]:
                if distance((x, y), (px, py)) < 100:  # 100px 반경 이내
                    nearby.add(path["name"])
                    break
        stations.append({"name": name, "x": x, "y": y, "lines": sorted(list(nearby))})

    print(f"✅ 총 {len(stations)}개 역 처리 완료")

    # 4️⃣ 중복 제거
    unique = {}
    for s in stations:
        if s["name"] not in unique:
            unique[s["name"]] = s
        else:
            unique[s["name"]]["lines"] = list(set(unique[s["name"]]["lines"] + s["lines"]))

    stations_final = list(unique.values())

    # 5️⃣ 저장
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(stations_final, f, ensure_ascii=False, indent=2)

    print(f"🎉 완료! {OUTPUT_PATH} 파일 생성 ({len(stations_final)}개 역)")

# -----------------------------
# 🚀 실행 시작점
# -----------------------------
if __name__ == "__main__":
    print(">>> 실행 시작")
    try:
        main()
    except Exception as e:
        print("❌ 오류 발생:", e)
    print(">>> 실행 완료")
