async function fetchAddressByCep(rawCep) {
  const cep = String(rawCep || "").replace(/\D/g, "");

  if (!/^\d{8}$/.test(cep)) {
    return { ok: false, type: "invalid_cep_format" };
  }

  const url = `https://viacep.com.br/ws/${cep}/json/`;
  const response = await fetch(url);

  if (response.status === 400) {
    return { ok: false, type: "invalid_cep_format" };
  }

  if (!response.ok) {
    return { ok: false, type: "external_api_error", status: response.status };
  }

  const data = await response.json();

  if (data.erro) {
    return { ok: false, type: "cep_not_found" };
  }

  return {
    ok: true,
    cep: data.cep,
    city: data.localidade,
    state: data.uf,
    neighborhood: data.bairro,
    street: data.logradouro
  };
}

module.exports = { fetchAddressByCep };
