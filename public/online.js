async function safeFetch(url, options) {
	const response = await fetch(`/api${url}`, options);
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	return response;
}

async function getOnline(username) {
	console.log('username', username);
	const response = await safeFetch(`/online?username=${username}`);
	const data = await response.json();
	return data;
}

async function postOnline(peerId, username) {
	const response = await safeFetch('/online', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ peerId, username }),
	});
	return response;
}

async function deleteOnline(peerId) {
	const response = await safeFetch(`/online/${peerId}`, {
		method: 'DELETE',
	});
	return response;
}
