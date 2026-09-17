import { test, expect } from '@playwright/test';

const user = { id: 'user-1', username: 'admin@example.com', email: 'admin@example.com', role: 'ADMIN', isActive: true };
const tests = [
  { id: 'test-cbc', code: 'CBC', name: 'Complete Blood Count', category: 'Hematology', department: 'HEMATOLOGY', sampleType: 'BLOOD', isActive: true, parameters: [
    { id: 'p-hb', name: 'Hemoglobin', inputType: 'NUMBER', unit: 'g/dL', normalMin: 12, normalMax: 17, referenceRange: { displayRange: '12 - 17 g/dL' }, isRequired: true, displayOrder: 1 },
    { id: 'p-wbc', name: 'WBC Count', inputType: 'NUMBER', unit: '10^3/uL', normalMin: 4, normalMax: 11, referenceRange: { displayRange: '4 - 11' }, isRequired: true, displayOrder: 2 },
  ] },
  { id: 'test-lipid', code: 'LIPID', name: 'Lipid Profile', category: 'Biochemistry', department: 'BIOCHEMISTRY', sampleType: 'SERUM', isActive: true, parameters: [
    { id: 'p-chol', name: 'Total Cholesterol', inputType: 'NUMBER', unit: 'mg/dL', normalMin: 0, normalMax: 200, referenceRange: { displayRange: '< 200 mg/dL' }, isRequired: true, displayOrder: 1 },
    { id: 'p-tg', name: 'Triglycerides', inputType: 'NUMBER', unit: 'mg/dL', normalMin: 0, normalMax: 150, referenceRange: { displayRange: '< 150 mg/dL' }, isRequired: true, displayOrder: 2 },
  ] },
];

const order = {
  id: 'order-e2e', orderNumber: 'ORD-E2E-001', status: 'FINAL',
  patient: { id: 'patient-e2e', name: 'UI Test Patient', age: 30, gender: 'MALE', mobile: '9999999999', email: 'patient@example.com' },
  referredBy: 'Dr. UI Test', clinicalNotes: 'Browser E2E',
  items: tests.map((test) => ({ id: `item-${test.id}`, testId: test.id, test, results: test.parameters.map((p) => ({ parameterId: p.id, value: '50', flag: 'NORMAL', parameter: p })) })),
  results: tests.flatMap((test) => test.parameters.map((p) => ({ parameterId: p.id, value: '50', flag: 'NORMAL' }))), samples: [],
};
const finalReport = { reportNumber: 'RPT-E2E-001', finalizedAt: new Date().toISOString(), order, orderId: order.id };

async function mockApi(page: import('@playwright/test').Page) {
  let authenticated = false;
  await page.route('http://localhost:3000/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace(/^\/+/, '');
    const method = request.method();
    if (path === 'auth/me' && method === 'GET') {
      return authenticated
        ? route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user }) })
        : route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Unauthorized' }) });
    }
    if (path === 'auth/login' && method === 'POST') {
      authenticated = true;
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ accessToken: 'ui-e2e-token', user }) });
    }
    if (path === 'auth/refresh' && method === 'POST') {
      return authenticated
        ? route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ accessToken: 'ui-e2e-token', user }) })
        : route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Unauthorized' }) });
    }
    if (path === 'auth/logout' && method === 'POST') {
      authenticated = false;
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
    }
    if (path === 'test-catalog' && method === 'GET') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(tests) });
    if (path === 'tests' && method === 'GET') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(tests) });
    if (path.startsWith('tests/') && method === 'GET') { const item = tests.find((t) => path === `tests/${t.id}`); return route.fulfill({ status: item ? 200 : 404, contentType: 'application/json', body: JSON.stringify(item ?? { message: 'Not found' }) }); }
    if (path === 'orders' && method === 'GET') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [order], pagination: { total: 1 } }) });
    if (path === `orders/${order.id}` && method === 'GET') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(order) });
    if (path === 'orders' && method === 'POST') return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(order) });
    if (path === `orders/${order.id}/report` && method === 'GET') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(finalReport) });
    if (path === `orders/${order.id}/report/pdf` && method === 'GET') return route.fulfill({ status: 200, contentType: 'application/pdf', body: '%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF\n' });
    if (path.startsWith('samples') || (path.startsWith('orders/') && path.endsWith('/results')) || path.endsWith('/verify') || path.endsWith('/finalize')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(order) });
    if (path.startsWith('patients')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(order.patient) });
    if (path === 'lab/settings') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ name: 'E2E Laboratory' }) });
    if (path === 'subscription/status') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ACTIVE', plan: 'PRO' }) });
    if (method === 'GET') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
  });
}

test.describe('PathMLT browser reporting flow', () => {
  test('login, select multiple tests, enter results, save, PDF and logout', async ({ page }) => {
    await mockApi(page);
    await page.goto('/');
    await expect(page.getByRole('button', { name: /sign in/i }).first()).toBeVisible();
    await page.getByRole('button', { name: /sign in/i }).first().click();
    await page.locator('#login-email').fill('admin@example.com');
    await page.locator('#login-password').fill('Password123!');
    await page.locator('form').getByRole('button', { name: /^Sign in$/ }).click();
    await expect(page.getByText(/Good to see you/i)).toBeVisible();
    const newReportButton = page.getByRole('button', { name: 'New Report', exact: true });
    await expect(newReportButton).toBeVisible({ timeout: 10000 });
    await newReportButton.click();
    await expect(page.getByRole('heading', { name: 'Create diagnostic report' })).toBeVisible();
    await page.getByLabel('Patient Full Name').fill('UI Test Patient');
    await page.getByLabel('Phone').fill('9999999999');
    await page.getByRole('button', { name: /Complete Blood Count/i }).click();
    await page.getByRole('button', { name: /Lipid Profile/i }).click();
    await expect(page.getByText('2 tests selected')).toBeVisible();
    const resultInputs = page.locator('.param-val-input');
    await expect(resultInputs).toHaveCount(4);
    for (let i = 0; i < 4; i += 1) await resultInputs.nth(i).fill('50');
    await page.getByLabel('Workflow Status').selectOption('Completed');
    await page.getByRole('button', { name: 'Save Diagnostic Report' }).click();
    await expect(page.getByRole('heading', { name: 'Patient Register' })).toBeVisible();
    await expect(page.getByText('UI Test Patient').first()).toBeVisible();
    const downloadPromise = page.waitForEvent('download');
    await page.locator('button[title^="Download"]').first().click();
    await downloadPromise;
    await page.locator('button[title^="Print"]').first().click();
    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page.getByRole('button', { name: /sign in/i }).first()).toBeVisible();
  });
});
