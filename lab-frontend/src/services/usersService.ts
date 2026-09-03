import { request } from './api';

export function listUsers() {
  return request('users');
}

export function getUser(id: string) {
  return request(`users/${id}`);
}

export function createUser(body: unknown) {
  return request('users', { method: 'POST', body: JSON.stringify(body) });
}

export function updateUser(id: string, body: unknown) {
  return request(`users/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
}

export function deleteUser(id: string) {
  return request(`users/${id}`, { method: 'DELETE' });
}

export default {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
