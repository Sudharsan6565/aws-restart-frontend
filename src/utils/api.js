const BASE_URL = import.meta.env.VITE_BACKEND_URL;

// src/utils/api.js
export async function apiFetch(path, method = "GET", body = null, token = "") {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : null,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.error || "API Error");
  }

  return res.json();
}

export async function uploadFile(file, token = "") {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.error || "Upload failed");
  }

  return res.json();
}
