export function buildRegimenPrompt(url: string, extractedText: string): string {
  return `
あなたは日本の抗がん剤専門医療AIアシスタントです。以下の提供情報（PDF抽出テキスト・URL・手入力）を最優先で参照し、さらに日本国内の添付文書・薬事承認情報・保険適用ルールの知識を活用して、正確な抗癌剤レジメン（治療計画）をJSONで生成してください。

【絶対ルール】
1. 提供データ優先順位: [1]PDF抽出テキスト → [2]URL情報 → [3]手入力 → [4]知識補完（日本の添付文書・ガイドライン）
2. 疾患名・薬剤名は提供データから正確に引用。捏造・類似薬への置換は禁止。
3. 薬剤名は「商品名（一般名）」形式（例: リツキサン（リツキシマブ）、ポライビー（ポラツズマブベドチン））。
4. dose=数値のみ（単位なし）、単位はdose_unitへ（例: dose="375", dose_unit="mg/m2"）。
5. 希釈液（生食・5%ブドウ糖液等）は抗がん剤と「同じitem行のbase_solution」フィールドに記載。別行は不要。
   例) drug_name_display="リツキサン（リツキシマブ）", base_solution="生理食塩液 250mL"
6. infusion_rateは必ず記載（PDFから抽出し、なければ日本添付文書の標準を補完）:
   主な標準例: リツキシマブ初回4時間以上/2回目以降90分 / パクリタキセル3時間 / カルボプラチン1時間 / シクロホスファミド30分 / ドキソルビシン静注 / ポラツズマブベドチン90分(初回)以降30分短縮可 / オビヌツズマブ初回Day1は25mg/h→後半50mg/h・2回目以降100mg/hから開始
7. excel_display_hintに必ず投与日を記載（例: Day 1, Day 1・8・15, Day 1-5）。
8. groupsの最初（sort_order=0）に必ず「ダミー本体」グループ（生食100mL・点滴・1瓶・20mL/h）を追加すること。
9. groupsは実際の投与順に並べる: ダミー本体 → 前投薬 → フラッシュ → 本体抗がん剤 → 後フラッシュ → 支持療法。
10. 日本保険診療準拠の投与量・投与方法・コース間隔を正確に記載すること。
11. regimen_support_info全項目を日本の添付文書・ガイドライン（JSCO・日本血液学会・NCCN日本版等）に基づき詳細記載。
12. 出力は純粋なJSONのみ。マークダウン記号・説明文は一切含めないこと。

[入力情報]
URL参照: ${url}
${extractedText}

[出力JSONスキーマ（厳守）]
{
  "regimen_core": {
    "regimen_name": "正式レジメン名（例: Pola-BR療法、R-CHOP療法）",
    "cancer_type": "日本保険病名準拠の疾患名（例: びまん性大細胞型B細胞リンパ腫）",
    "treatment_purpose": "治療目的（例: 再発難治、一次治療、寛解導入）",
    "inpatient_outpatient": "入院 または 外来",
    "interval_days": 21,
    "reference_sources": "添付文書・ガイドライン名・論文",
    "courses": [
      {
        "course_id": "生成UUID",
        "course_name": "本コース",
        "groups": [
          {
            "group_id": "生成UUID",
            "sort_order": 0,
            "group_no": "0",
            "group_name": "ダミー本体",
            "group_type": "その他",
            "items": [
              {
                "item_id": "生成UUID",
                "drug_name_display": "生理食塩液",
                "base_solution": "100mL",
                "administration_method": "点滴",
                "dose": "1",
                "dose_unit": "瓶",
                "infusion_rate": "20mL/h",
                "schedule": { "repeat_pattern": "単回", "day_start": 1, "excel_display_hint": "Day 1〜21" },
                "comments": [{ "comment_type": "運用", "text": "ダミー本体ライン、前投薬開始前に開通（生針記入）" }]
              }
            ]
          },
          {
            "group_id": "生成UUID",
            "sort_order": 1,
            "group_no": "1",
            "group_name": "前投薬",
            "group_type": "前投薬",
            "items": [
              {
                "item_id": "生成UUID",
                "drug_name_display": "商品名（一般名）",
                "base_solution": "希釈液（例: 生理食塩液100mL）",
                "administration_method": "点滴 または 経口 または 静注",
                "dose": "数値のみ",
                "dose_unit": "mg/body または mg/m2",
                "infusion_rate": "投与時間（例: 30分）必須",
                "schedule": { "repeat_pattern": "単回", "day_start": 1, "excel_display_hint": "Day 1" },
                "comments": []
              }
            ]
          },
          {
            "group_id": "生成UUID",
            "sort_order": 2,
            "group_no": "2",
            "group_name": "本体（レジメン名）",
            "group_type": "抗癌剤",
            "items": [
              {
                "item_id": "生成UUID",
                "drug_name_display": "商品名（一般名）",
                "base_solution": "希釈液（例: 生理食塩液250mL）",
                "administration_method": "点滴",
                "dose": "数値のみ",
                "dose_unit": "mg/m2",
                "infusion_rate": "投与時間（例: 初回4時間以上、2回目以降90分）",
                "schedule": { "repeat_pattern": "単回", "day_start": 1, "excel_display_hint": "Day 1" },
                "comments": [{ "comment_type": "注意", "text": "アレルギー反応出現時は速度を落とすか中止" }]
              }
            ]
          }
        ]
      }
    ]
  },
  "regimen_support_info": {
    "basic_info": "レジメン概要・エビデンス（試験名・主要論文・奏効率等）",
    "indications": "日本国内承認の保険適用適応症（添付文書準拠）",
    "contraindications": "禁忌事項（日本添付文書準拠: 過敏症・妊娠・重篤な臓器障害等）",
    "start_criteria": "投与開始基準（PS・血液検査値・臓器機能など定量的基準）",
    "stop_criteria": "投与中止・延期基準（CTCAEグレードや具体的な閾値）",
    "dose_reduction": "減量・休薬基準（グレードと対応する投与量の変更方法）",
    "adverse_effects_and_management": "主な副作用と対処法（発生頻度・グレード・具体的な対処を含む）",
    "references": "参考文献（日本の添付文書・JSCO・日本血液学会ガイドライン・主要論文）"
  }
}
`;
}
