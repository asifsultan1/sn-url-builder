import { describe, it, expect } from "vitest";
import { parseUrl } from "./parser";
import { buildUrl } from "./encoder";
import type { SearchModel } from "./types";

const COMPANY_URL =
  "https://www.linkedin.com/sales/search/company?query=(filters%3AList((type%3AINDUSTRY%2Cvalues%3AList((id%3A27%2Ctext%3ARetail%2CselectionType%3AINCLUDED)))%2C(type%3AANNUAL_REVENUE%2CrangeValue%3A(min%3A5%2Cmax%3A500)%2CselectedSubFilter%3AUSD)%2C(type%3ACOMPANY_HEADCOUNT%2Cvalues%3AList((id%3AB%2Ctext%3A1-10%2CselectionType%3AINCLUDED)%2C(id%3AC%2Ctext%3A11-50%2CselectionType%3AINCLUDED)%2C(id%3AD%2Ctext%3A51-200%2CselectionType%3AINCLUDED)%2C(id%3AF%2Ctext%3A501-1%252C000%2CselectionType%3AINCLUDED)%2C(id%3AE%2Ctext%3A201-500%2CselectionType%3AINCLUDED)%2C(id%3AG%2Ctext%3A1%252C001-5%252C000%2CselectionType%3AINCLUDED)%2C(id%3AH%2Ctext%3A5%252C001-10%252C000%2CselectionType%3AINCLUDED)%2C(id%3AI%2Ctext%3A10%252C001%252B%2CselectionType%3AINCLUDED)))%2C(type%3ACOMPANY_HEADCOUNT_GROWTH%2CrangeValue%3A(min%3A1%2Cmax%3A5))%2C(type%3AREGION%2Cvalues%3AList((id%3A103644278%2Ctext%3AUnited%2520States%2CselectionType%3AINCLUDED)%2C(id%3A106057199%2Ctext%3ABrazil%2CselectionType%3AINCLUDED)%2C(id%3A102713980%2Ctext%3AIndia%2CselectionType%3AINCLUDED)%2C(id%3A101022442%2Ctext%3APakistan%2CselectionType%3AINCLUDED)%2C(id%3A104170880%2Ctext%3AQatar%2CselectionType%3AINCLUDED)%2C(id%3A103239229%2Ctext%3AKuwait%2CselectionType%3AINCLUDED)%2C(id%3A103619019%2Ctext%3AOman%2CselectionType%3AINCLUDED)%2C(id%3A100425729%2Ctext%3ABahrain%2CselectionType%3AINCLUDED)%2C(id%3A101934083%2Ctext%3AIran%2CselectionType%3AINCLUDED)%2C(id%3A102105699%2Ctext%3AT%25C3%25BCrkiye%2CselectionType%3AINCLUDED)%2C(id%3A104677530%2Ctext%3AGreece%2CselectionType%3AINCLUDED)%2C(id%3A106670623%2Ctext%3ARomania%2CselectionType%3AINCLUDED)%2C(id%3A100288700%2Ctext%3AHungary%2CselectionType%3AINCLUDED)%2C(id%3A101452733%2Ctext%3AAustralia%2CselectionType%3AINCLUDED)%2C(id%3A103883259%2Ctext%3AAustria%2CselectionType%3AINCLUDED)%2C(id%3A102890883%2Ctext%3AChina%2CselectionType%3AINCLUDED)%2C(id%3A101728296%2Ctext%3ARussia%2CselectionType%3AINCLUDED)%2C(id%3A106155005%2Ctext%3AEgypt%2CselectionType%3AINCLUDED)%2C(id%3A100212432%2Ctext%3AEthiopia%2CselectionType%3AINCLUDED)%2C(id%3A106215326%2Ctext%3ABangladesh%2CselectionType%3AINCLUDED)%2C(id%3A100446352%2Ctext%3ASri%2520Lanka%2CselectionType%3AINCLUDED)%2C(id%3A102454443%2Ctext%3ASingapore%2CselectionType%3AINCLUDED)%2C(id%3A102478259%2Ctext%3AIndonesia%2CselectionType%3AINCLUDED)%2C(id%3A106808692%2Ctext%3AMalaysia%2CselectionType%3AINCLUDED)))%2C(type%3ANUM_OF_FOLLOWERS%2Cvalues%3AList((id%3ANFR5%2Ctext%3A5001%252B%2CselectionType%3AINCLUDED)%2C(id%3ANFR1%2Ctext%3A1-50%2CselectionType%3AINCLUDED)%2C(id%3ANFR2%2Ctext%3A51-100%2CselectionType%3AINCLUDED)%2C(id%3ANFR3%2Ctext%3A101-1000%2CselectionType%3AINCLUDED)%2C(id%3ANFR4%2Ctext%3A1001-5000%2CselectionType%3AINCLUDED)))%2C(type%3AJOB_OPPORTUNITIES%2Cvalues%3AList((id%3AJO1%2Ctext%3AHiring%2520on%2520Linkedin%2CselectionType%3AINCLUDED)))%2C(type%3AACCOUNT_ACTIVITIES%2Cvalues%3AList((id%3ARFE%2Ctext%3AFunding%2520events%2520in%2520past%252012%2520months%2CselectionType%3AINCLUDED)%2C(id%3ASLC%2Ctext%3ASenior%2520leadership%2520changes%2520in%2520last%25203%2520months%2CselectionType%3AINCLUDED)))%2C(type%3ADEPARTMENT_HEADCOUNT%2CrangeValue%3A(min%3A1%2Cmax%3A11)%2CselectedSubFilter%3A1)%2C(type%3ADEPARTMENT_HEADCOUNT_GROWTH%2CrangeValue%3A(min%3A1%2Cmax%3A12)%2CselectedSubFilter%3A1)%2C(type%3AFORTUNE%2Cvalues%3AList((id%3A1%2Ctext%3AFortune%252050%2CselectionType%3AINCLUDED)%2C(id%3A2%2Ctext%3AFortune%252051-100%2CselectionType%3AINCLUDED)%2C(id%3A3%2Ctext%3AFortune%2520101-250%2CselectionType%3AINCLUDED)%2C(id%3A4%2Ctext%3AFortune%2520251-500%2CselectionType%3AINCLUDED)))))&sessionId=roVugHZHSh6dS4Q6okecug%3D%3D&viewAllFilters=true";

const PEOPLE_URL =
  "https://www.linkedin.com/sales/search/people#query=(recentSearchParam%3A(id%3A4371326009%2CdoLogHistory%3Atrue)%2Cfilters%3AList((type%3AREGION%2Cvalues%3AList((id%3A100459316%2Ctext%3ASaudi%2520Arabia%2CselectionType%3AINCLUDED)%2C(id%3A91000008%2Ctext%3AMENA%2CselectionType%3AINCLUDED)))%2C(type%3AINDUSTRY%2Cvalues%3AList((id%3A27%2Ctext%3ARetail%2CselectionType%3AINCLUDED)%2C(id%3A43%2Ctext%3AFinancial%2520Services%2CselectionType%3AEXCLUDED)))%2C(type%3ACURRENT_TITLE%2Cvalues%3AList((text%3Aecommerce%2CselectionType%3AINCLUDED)%2C(text%3A%25D9%2585%25D8%25AF%25D9%258A%25D8%25B1%2520%25D8%25A7%25D9%2584%25D8%25AA%25D8%25AC%25D8%25A7%25D8%25B1%25D8%25A9%2520%25D8%25A7%25D9%2584%25D8%25A5%25D9%2584%25D9%2583%25D8%25AA%25D8%25B1%25D9%2588%25D9%2586%25D9%258A%25D8%25A9%2CselectionType%3AINCLUDED)%2C(id%3A35%2Ctext%3AFounder%2CselectionType%3AINCLUDED)))%2C(type%3ASENIORITY_LEVEL%2Cvalues%3AList((id%3A320%2Ctext%3AOwner%2520%252F%2520Partner%2CselectionType%3AINCLUDED)%2C(id%3A110%2Ctext%3AEntry%2520Level%2CselectionType%3AEXCLUDED)))%2C(type%3ACURRENT_COMPANY%2Cvalues%3AList((id%3Aurn%253Ali%253Aorganization%253A14383281%2Ctext%3APositivity%2520%25C2%25AE%2CselectionType%3AEXCLUDED%2Cparent%3A(id%3A0))))%2C(type%3APAST_COMPANY%2Cvalues%3AList((id%3Aurn%253Ali%253Aorganization%253A1116%2Ctext%3AProcter%2520%2526%2520Gamble%2CselectionType%3AEXCLUDED%2Cparent%3A(id%3A0))))%2C(type%3ACOMPANY_HEADCOUNT%2Cvalues%3AList((id%3AH%2Ctext%3A5001-10%252C000%2CselectionType%3AINCLUDED)%2C(id%3AI%2Ctext%3A10%252C000%252B%2CselectionType%3AINCLUDED)))%2C(type%3ACOMPANY_TYPE%2Cvalues%3AList((id%3AN%2Ctext%3ANon%2520Profit%2CselectionType%3AINCLUDED)))%2C(type%3ACOMPANY_HEADQUARTERS%2Cvalues%3AList((id%3A104305776%2Ctext%3AUnited%2520Arab%2520Emirates%2CselectionType%3AINCLUDED)))%2C(type%3APAST_TITLE%2Cvalues%3AList((text%3ACEO%2CselectionType%3AINCLUDED)))%2C(type%3AYEARS_IN_CURRENT_POSITION%2Cvalues%3AList((id%3A2%2Ctext%3A1%2520to%25202%2520years%2CselectionType%3AINCLUDED)))%2C(type%3APROFILE_LANGUAGE%2Cvalues%3AList((id%3Aar%2Ctext%3AArabic%2CselectionType%3AINCLUDED)%2C(id%3Ain%2Ctext%3ABahasa%2520Indonesia%2CselectionType%3AINCLUDED)))%2C(type%3AFUNCTION%2Cvalues%3AList((id%3A15%2Ctext%3AMarketing%2CselectionType%3AINCLUDED)%2C(id%3A18%2Ctext%3AOperations%2CselectionType%3AINCLUDED)%2C(id%3A26%2Ctext%3ACustomer%2520Success%2520and%2520Support%2CselectionType%3AINCLUDED)))))&sessionId=4LTu1k85T%2BqUaPVli5zasw%3D%3D&viewAllFilters=true";

describe("§9.1 company fixture round-trip", () => {
  it("build(parse(url)) === url with session params stripped (byte-for-byte)", () => {
    const stripped = COMPANY_URL.split("&sessionId")[0];
    const model = parseUrl(COMPANY_URL);
    expect(model.kind).toBe("company");
    expect(buildUrl(model)).toBe(stripped);
  });

  it("reports dropped session params", () => {
    const model = parseUrl(COMPANY_URL);
    expect(model.dropped).toContain("sessionId");
    expect(model.dropped).toContain("viewAllFilters");
  });
});

describe("§9.2 people fixture", () => {
  it("detects people + # prefix, drops recentSearchParam", () => {
    const model = parseUrl(PEOPLE_URL);
    expect(model.kind).toBe("people");
    expect(model.prefix).toBe("#");
    expect(model.dropped).toContain("recentSearchParam");
  });

  it("decodes tricky values correctly", () => {
    const m = parseUrl(PEOPLE_URL);
    const title = m.filters.find((f) => f.type === "CURRENT_TITLE")!;
    expect(title.values!.map((v) => v.text)).toEqual([
      "ecommerce",
      "مدير التجارة الإلكترونية",
      "Founder",
    ]);

    const cur = m.filters.find((f) => f.type === "CURRENT_COMPANY")!;
    expect(cur.parent).toBe(true);
    expect(cur.values![0]).toMatchObject({
      id: "urn:li:organization:14383281",
      text: "Positivity ®",
      mode: "EXCLUDED",
    });

    const past = m.filters.find((f) => f.type === "PAST_COMPANY")!;
    expect(past.values![0].text).toBe("Procter & Gamble");

    const seniority = m.filters.find((f) => f.type === "SENIORITY_LEVEL")!;
    expect(seniority.values).toEqual([
      { id: "320", text: "Owner / Partner", mode: "INCLUDED" },
      { id: "110", text: "Entry Level", mode: "EXCLUDED" },
    ]);
  });

  it("is idempotent under parse∘build∘parse", () => {
    const m1 = parseUrl(PEOPLE_URL);
    const m2 = parseUrl(buildUrl(m1));
    // build does not re-emit recentSearchParam / session params.
    expect(m2.filters).toEqual(m1.filters);
    expect(m2.keywords).toBe(m1.keywords);
    expect(m2.kind).toBe(m1.kind);
  });
});

describe("parse(build(x)) === x on generated models", () => {
  const models: SearchModel[] = [
    {
      kind: "people",
      keywords: "(VP OR Director) AND retail",
      prefix: "?",
      filters: [
        {
          type: "REGION",
          values: [
            { id: "100459316", text: "Saudi Arabia", mode: "INCLUDED" },
            { id: "91000008", text: "MENA", mode: "EXCLUDED" },
          ],
        },
        {
          type: "CURRENT_TITLE",
          values: [{ text: "مدير", mode: "INCLUDED" }],
        },
        {
          type: "CURRENT_COMPANY",
          parent: true,
          values: [
            {
              id: "urn:li:organization:1116",
              text: "Procter & Gamble",
              mode: "EXCLUDED",
            },
          ],
        },
      ],
    },
    {
      kind: "company",
      keywords: "",
      prefix: "?",
      filters: [
        { type: "ANNUAL_REVENUE", range: { min: 5, max: 500 }, sub: "USD" },
        { type: "COMPANY_HEADCOUNT_GROWTH", range: { min: 1, max: 5 } },
        {
          type: "INDUSTRY",
          values: [{ id: "27", text: "Retail", mode: "INCLUDED" }],
        },
      ],
    },
  ];

  it.each(models)("round-trips %#", (model) => {
    const round = parseUrl(buildUrl(model));
    expect(round.kind).toBe(model.kind);
    expect(round.keywords).toBe(model.keywords);
    expect(round.prefix).toBe(model.prefix);
    expect(round.filters).toEqual(model.filters);
  });
});
