import { describe, it, expect } from "vitest";
import { valueStr, filterStr, buildQuery } from "./encoder";
import type { Filter, FilterValue } from "./types";

const enc = (s: string | null) => (s == null ? null : encodeURIComponent(s));

describe("§3.5 whole-value encodings", () => {
  const cases: Array<[FilterValue, boolean, string]> = [
    [
      { id: "100459316", text: "Saudi Arabia", mode: "INCLUDED" },
      false,
      "(id%3A100459316%2Ctext%3ASaudi%2520Arabia%2CselectionType%3AINCLUDED)",
    ],
    [
      { id: "27", text: "Retail", mode: "INCLUDED" },
      false,
      "(id%3A27%2Ctext%3ARetail%2CselectionType%3AINCLUDED)",
    ],
    [
      { id: "320", text: "Owner / Partner", mode: "INCLUDED" },
      false,
      "(id%3A320%2Ctext%3AOwner%2520%252F%2520Partner%2CselectionType%3AINCLUDED)",
    ],
    [
      { id: "I", text: "10,000+", mode: "INCLUDED" },
      false,
      "(id%3AI%2Ctext%3A10%252C000%252B%2CselectionType%3AINCLUDED)",
    ],
    [
      { id: "H", text: "5001-10,000", mode: "INCLUDED" },
      false,
      "(id%3AH%2Ctext%3A5001-10%252C000%2CselectionType%3AINCLUDED)",
    ],
    [
      { id: "in", text: "Bahasa Indonesia", mode: "INCLUDED" },
      false,
      "(id%3Ain%2Ctext%3ABahasa%2520Indonesia%2CselectionType%3AINCLUDED)",
    ],
    [
      { text: "omnichannel", mode: "INCLUDED" },
      false,
      "(text%3Aomnichannel%2CselectionType%3AINCLUDED)",
    ],
    [
      { text: "مدير", mode: "INCLUDED" },
      false,
      "(text%3A%25D9%2585%25D8%25AF%25D9%258A%25D8%25B1%2CselectionType%3AINCLUDED)",
    ],
    [
      {
        id: "urn:li:organization:14383281",
        text: "Positivity ®",
        mode: "EXCLUDED",
      },
      true,
      "(id%3Aurn%253Ali%253Aorganization%253A14383281%2Ctext%3APositivity%2520%25C2%25AE%2CselectionType%3AEXCLUDED%2Cparent%3A(id%3A0))",
    ],
    [
      {
        id: "urn:li:organization:1116",
        text: "Procter & Gamble",
        mode: "EXCLUDED",
      },
      true,
      "(id%3Aurn%253Ali%253Aorganization%253A1116%2Ctext%3AProcter%2520%2526%2520Gamble%2CselectionType%3AEXCLUDED%2Cparent%3A(id%3A0))",
    ],
    [
      { text: "(VP OR Director)", mode: "INCLUDED" },
      false,
      "(text%3A%2528VP%2520OR%2520Director%2529%2CselectionType%3AINCLUDED)",
    ],
  ];

  it.each(cases)("encodes %o (parent=%s)", (v, parent, expected) => {
    expect(enc(valueStr(v, parent))).toBe(expected);
  });
});

describe("§3.5 range-filter encodings", () => {
  const cases: Array<[Filter, string]> = [
    [
      { type: "ANNUAL_REVENUE", range: { min: 5, max: 500 }, sub: "USD" },
      "(type%3AANNUAL_REVENUE%2CrangeValue%3A(min%3A5%2Cmax%3A500)%2CselectedSubFilter%3AUSD)",
    ],
    [
      { type: "COMPANY_HEADCOUNT_GROWTH", range: { min: 1, max: 5 } },
      "(type%3ACOMPANY_HEADCOUNT_GROWTH%2CrangeValue%3A(min%3A1%2Cmax%3A5))",
    ],
    [
      { type: "DEPARTMENT_HEADCOUNT", range: { min: 1, max: 11 }, sub: "1" },
      "(type%3ADEPARTMENT_HEADCOUNT%2CrangeValue%3A(min%3A1%2Cmax%3A11)%2CselectedSubFilter%3A1)",
    ],
  ];
  it.each(cases)("encodes range %o", (f, expected) => {
    expect(enc(filterStr(f))).toBe(expected);
  });
});

describe("§3.5 value vectors lifted from range section", () => {
  it("NFR5 5001+", () => {
    expect(
      enc(valueStr({ id: "NFR5", text: "5001+", mode: "INCLUDED" }))
    ).toBe("(id%3ANFR5%2Ctext%3A5001%252B%2CselectionType%3AINCLUDED)");
  });
  it("Fortune 50", () => {
    expect(
      enc(valueStr({ id: "1", text: "Fortune 50", mode: "INCLUDED" }))
    ).toBe("(id%3A1%2Ctext%3AFortune%252050%2CselectionType%3AINCLUDED)");
  });
});

describe("§3.5 whole-query smoke test", () => {
  it("REGION Saudi Arabia", () => {
    expect(
      buildQuery("", [
        {
          type: "REGION",
          parent: false,
          values: [{ id: "100459316", text: "Saudi Arabia", mode: "INCLUDED" }],
        },
      ])
    ).toBe(
      "(filters%3AList((type%3AREGION%2Cvalues%3AList((id%3A100459316%2Ctext%3ASaudi%2520Arabia%2CselectionType%3AINCLUDED)))))"
    );
  });

  it("drops empty filters and returns null when nothing to emit", () => {
    expect(buildQuery("", [{ type: "REGION", values: [] }])).toBeNull();
    expect(buildQuery("", [])).toBeNull();
  });
});
