async function deleteSale(id) {
  if (!confirm("Delete this sale?")) return;

  const token = JSON.parse(localStorage.getItem("agro_user"))?.token;

  const res = await fetch(`/api/sales/${id}`, {
    method: "DELETE",
    headers: { "Authorization": "Bearer " + token }
  });

  const data = await res.json();

  if (res.ok) {
    alert("Sale deleted");
    loadSales(); // refresh list
  } else {
    alert(data.error);
  }
}
