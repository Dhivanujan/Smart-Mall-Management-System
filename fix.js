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
    content = content.replace(/import \{ DashboardLayout \} from ['\"]@\/components\/layout\/DashboardLayout['\"];\r?\n?/g, '');
    content = content.replace(/import \{ ADMIN_NAV \} from ['\"]@\/constants\/navigation['\"];\r?\n?/g, '');
    content = content.replace(/import \{ SUPER_ADMIN_NAV \} from ['\"]@\/constants\/navigation['\"];\r?\n?/g, '');
    content = content.replace(/return \(\s*<DashboardLayout[^>]*>/, 'return (<>');
    content = content.replace(/<\/DashboardLayout>(\s*\);\s*};?)\s*$/, '</>');
    fs.writeFileSync(f, content);
});
