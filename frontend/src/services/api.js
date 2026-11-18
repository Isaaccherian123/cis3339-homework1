/**
 * Thin wrapper around fetch for the Express REST API.
 * All requests use relative /api URLs, which work both in production
 * (served by Express) and in development (Vite proxy).
 */
export class ApiError extends Error {
    constructor(message, status = 0, details = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.details = details;
    }
}

async function request(path, { method = 'GET', body } = {}) {
    const options = { method, headers: { Accept: 'application/json' } };
    if (body !== undefined) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
    }

    let response;
    try {
        response = await fetch(`/api${path}`, options);
    } catch {
        throw new ApiError('Unable to reach the server. Check that the backend is running.');
    }

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json().catch(() => null) : null;

    if (!response.ok) {
        throw new ApiError(
            data?.error || `Request failed with status ${response.status}.`,
            response.status,
            data?.details ?? null
        );
    }
    return data;
}

const enc = encodeURIComponent;

export const studentsApi = {
    list: (search = '') => request(search ? `/students?search=${enc(search)}` : '/students'),
    create: (student) => request('/students', { method: 'POST', body: student }),
    remove: (studentId) => request(`/students/${enc(studentId)}`, { method: 'DELETE' }),
};

export const coursesApi = {
    list: () => request('/courses'),
    create: (course) => request('/courses', { method: 'POST', body: course }),
    remove: (courseId) => request(`/courses/${enc(courseId)}`, { method: 'DELETE' }),
    roster: (courseId) => request(`/courses/${enc(courseId)}/students`),
    unenroll: (courseId, studentId) =>
        request(`/courses/${enc(courseId)}/students/${enc(studentId)}`, { method: 'DELETE' }),
};

export const enrollmentsApi = {
    create: (studentId, courseId) =>
        request('/enrollments', { method: 'POST', body: { studentId, courseId } }),
};
