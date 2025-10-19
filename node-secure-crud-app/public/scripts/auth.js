
async function authFetch(url, options = {}) {
    let token = localStorage.getItem('accessToken');
    
    if (!options.headers) options.headers = {};
    options.headers['Authorization'] = `Bearer ${token}`;

    let response = await fetch(url, options);

    if (response.status === 401) {
        const refreshResponse = await fetch('/auth/refresh-token', {
            method: 'POST',
            credentials: 'include' 
        });

        if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            localStorage.setItem('accessToken', data.token);

            options.headers['Authorization'] = `Bearer ${data.token}`;
            response = await fetch(url, options);
        } else {

            localStorage.removeItem('accessToken');
            window.location.href = '/auth/login';
            return;
        }
    }

    return response;
}
