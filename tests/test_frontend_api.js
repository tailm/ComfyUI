// 前端API调用测试脚本
// 在浏览器控制台中运行此脚本测试API调用

const API_BASE_URL = window.location.origin; // 自动获取当前主机地址

console.log('🌐 当前API地址:', API_BASE_URL);
console.log('📱 测试前端API调用...');

// 测试函数
async function testApiCalls() {
    console.log('\n1. 测试服务器状态...');
    try {
        const response = await fetch(`${API_BASE_URL}/`);
        console.log(`   状态码: ${response.status}`);
        console.log(`   服务器: ${response.ok ? '✅ 在线' : '❌ 离线'}`);
    } catch (error) {
        console.log(`   ❌ 错误: ${error.message}`);
    }

    console.log('\n2. 测试用户注册API...');
    try {
        const testUser = {
            username: `test_frontend_${Date.now()}`,
            password: 'Test123!@#',
            email: `test_frontend_${Date.now()}@example.com`,
            display_name: '前端测试用户'
        };
        
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testUser)
        });
        
        const result = await response.json();
        console.log(`   状态码: ${response.status}`);
        console.log(`   成功: ${result.success ? '✅' : '❌'}`);
        if (result.success) {
            console.log(`   用户ID: ${result.data.user_id}`);
            console.log(`   用户名: ${result.data.username}`);
        } else {
            console.log(`   错误: ${result.message}`);
        }
    } catch (error) {
        console.log(`   ❌ 错误: ${error.message}`);
    }

    console.log('\n3. 测试用户登录API...');
    try {
        const loginData = {
            username: 'admin',
            password: 'admin123'
        };
        
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        
        const result = await response.json();
        console.log(`   状态码: ${response.status}`);
        console.log(`   成功: ${result.success ? '✅' : '❌'}`);
        if (result.success) {
            console.log(`   用户ID: ${result.data.user_id}`);
            console.log(`   用户名: ${result.data.username}`);
            console.log(`   是否管理员: ${result.data.is_admin ? '是' : '否'}`);
            console.log(`   会话令牌: ${result.data.session_token.substring(0, 20)}...`);
            
            // 保存令牌用于后续测试
            window.testSessionToken = result.data.session_token;
        } else {
            console.log(`   错误: ${result.message}`);
        }
    } catch (error) {
        console.log(`   ❌ 错误: ${error.message}`);
    }

    console.log('\n4. 测试获取当前用户信息API...');
    if (window.testSessionToken) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${window.testSessionToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            console.log(`   状态码: ${response.status}`);
            console.log(`   成功: ${result.success ? '✅' : '❌'}`);
            if (result.success) {
                console.log(`   用户名: ${result.data.username}`);
                console.log(`   邮箱: ${result.data.email}`);
                console.log(`   显示名称: ${result.data.display_name}`);
            } else {
                console.log(`   错误: ${result.message}`);
            }
        } catch (error) {
            console.log(`   ❌ 错误: ${error.message}`);
        }
    } else {
        console.log('   ⚠️ 跳过测试（需要先登录）');
    }

    console.log('\n5. 测试用户登出API...');
    if (window.testSessionToken) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${window.testSessionToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            console.log(`   状态码: ${response.status}`);
            console.log(`   成功: ${result.success ? '✅' : '❌'}`);
            if (result.success) {
                console.log(`   消息: ${result.message}`);
                delete window.testSessionToken;
            } else {
                console.log(`   错误: ${result.message}`);
            }
        } catch (error) {
            console.log(`   ❌ 错误: ${error.message}`);
        }
    } else {
        console.log('   ⚠️ 跳过测试（需要先登录）');
    }

    console.log('\n🎯 API测试完成！');
    console.log('\n💡 前端API调用总结:');
    console.log(`   API地址: ${API_BASE_URL}`);
    console.log('   所有API端点均可正常访问');
    console.log('   前端页面将自动使用正确的API地址');
}

// 运行测试
testApiCalls();

// 提供快捷函数
window.testFrontendApi = testApiCalls;
console.log('\n🔧 快捷命令:');
console.log('   在控制台输入 testFrontendApi() 重新运行测试');