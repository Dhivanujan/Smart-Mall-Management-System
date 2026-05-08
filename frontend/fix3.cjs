const fs = require('fs');
const files = [
    'E:/SmartMallManagementSystem/frontend/src/features/store-admin/AdminDashboardPage.jsx',
    'E:/SmartMallManagementSystem/frontend/src/features/store-admin/AdminStoresPage.jsx',
    'E:/SmartMallManagementSystem/frontend/src/features/super-admin/SuperAdminDashboardPage.jsx',
    'E:/SmartMallManagementSystem/frontend/src/features/super-admin/SuperAdminAdminsPage.jsx',
    'E:/SmartMallManagementSystem/frontend/src/features/super-admin/SuperAdminTenantsPage.jsx'
];
files.forEach(f => {
    let content = fs.readFileSync(f, 'utf-8');
    if (content.trim().endsWith('</>')) {
        content = content.trim() + '\n);\n};';
        fs.writeFileSync(f, content);
    }
});
