const REGION_BY_UF = {
  AC: "NORTE", AP: "NORTE", AM: "NORTE", PA: "NORTE", RO: "NORTE", RR: "NORTE", TO: "NORTE",
  AL: "NORDESTE", BA: "NORDESTE", CE: "NORDESTE", MA: "NORDESTE", PB: "NORDESTE", PE: "NORDESTE", PI: "NORDESTE", RN: "NORDESTE", SE: "NORDESTE",
  DF: "CENTRO_OESTE", GO: "CENTRO_OESTE", MT: "CENTRO_OESTE", MS: "CENTRO_OESTE",
  ES: "SUDESTE", MG: "SUDESTE", RJ: "SUDESTE", SP: "SUDESTE",
  PR: "SUL", RS: "SUL", SC: "SUL"
};

function estimateFreightCents(state, subtotalCents) {
  const region = REGION_BY_UF[state];

  if (!region) {
    return 3000;
  }

  let base = 0;

  if (region === "SUDESTE") base = 1200;
  if (region === "SUL") base = 1600;
  if (region === "CENTRO_OESTE") base = 1800;
  if (region === "NORDESTE") base = 2400;
  if (region === "NORTE") base = 3000;

  if (subtotalCents >= 30000) {
    base = Math.max(0, base - 500);
  }

  return base;
}

module.exports = { estimateFreightCents };
