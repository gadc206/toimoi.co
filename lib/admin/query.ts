type AdminPeopleQuery = {
  status?: string;
  gender?: string;
  q?: string;
};

export function adminPeopleHref(params: AdminPeopleQuery): string {
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  if (params.gender) search.set("gender", params.gender);
  if (params.q) search.set("q", params.q);
  const query = search.toString();
  return query ? `/admin?${query}` : "/admin";
}
