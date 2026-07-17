from aiohttp import web
from datetime import datetime
from sqlalchemy.orm import Session
import logging
import os

from app.database.db import create_session
from app.services.captcha_service import CaptchaService
from app.services.auth_service import AuthService


# 创建路由表
ROUTES = web.RouteTableDef()


@ROUTES.get('/user-select')
async def redirect_user_select(request: web.Request) -> web.Response:
    """重定向user-select到登录页面"""
    # 检查是否已有用户ID
    user_id = request.cookies.get('user_id') or request.query.get('user_id')
    
    if user_id:
        # 如果已有用户ID，直接跳转到主页
        return web.Response(
            status=302,
            headers={'Location': '/'}
        )
    else:
        # 否则跳转到登录页面
        return web.Response(
            status=302,
            headers={'Location': '/login'}
        )


@ROUTES.get('/api/captcha')
async def get_captcha(request: web.Request) -> web.Response:
    """生成验证码"""
    try:
        with create_session() as session:
            captcha_service = CaptchaService(session)
            captcha_id, image_data = captcha_service.create_captcha_session()
            
            # 返回图片数据，在响应头中包含captcha_id
            response = web.Response(
                body=image_data,
                content_type='image/png',
                headers={'X-Captcha-Id': captcha_id}
            )
            return response
    except Exception as e:
        logging.error(f"生成验证码失败: {str(e)}")
        return web.json_response(
            {'success': False, 'message': f'生成验证码失败: {str(e)}'},
            status=500
        )


@ROUTES.post('/api/v2/register')
async def register(request: web.Request) -> web.Response:
    """处理注册请求（需要验证码）"""
    try:
        # 解析JSON请求体
        data = await request.json()
        username = data.get('username', '').strip()
        password = data.get('password', '')
        captcha = data.get('captcha', '').strip()
        captcha_id = data.get('captcha_id', '')
        
        # 验证输入
        if not username or not password or not captcha or not captcha_id:
            return web.json_response(
                {'success': False, 'message': '请填写所有必填项'},
                status=400
            )
        
        with create_session() as session:
            # 验证验证码
            captcha_service = CaptchaService(session)
            captcha_valid, captcha_msg = captcha_service.verify_captcha(captcha_id, captcha)
            
            if not captcha_valid:
                return web.json_response(
                    {'success': False, 'message': captcha_msg},
                    status=400
                )
            
            # 注册用户
            auth_service = AuthService(session)
            success, message, user = auth_service.register(username, password)
            
            if success:
                # 注册成功
                return web.json_response({
                    'success': True,
                    'message': message,
                    'user': user.to_dict() if user else None,
                    'user_id': user.id if user else None
                })
            else:
                # 注册失败
                return web.json_response(
                    {'success': False, 'message': message},
                    status=400
                )
    
    except Exception as e:
        logging.error(f"注册失败: {str(e)}")
        return web.json_response(
            {'success': False, 'message': f'注册失败: {str(e)}'},
            status=500
        )


@ROUTES.post('/api/v2/login')
async def login(request: web.Request) -> web.Response:
    """处理登录请求（支持验证码，不会自动创建用户）"""
    try:
        # 解析JSON请求体
        data = await request.json()
        username = data.get('username', '').strip()
        password = data.get('password', '')
        captcha = data.get('captcha', '').strip()
        captcha_id = data.get('captcha_id', '')
        
        # 验证输入
        if not username or not password or not captcha or not captcha_id:
            return web.json_response(
                {'success': False, 'message': '请填写所有必填项'},
                status=400
            )
        
        with create_session() as session:
            # 验证验证码
            captcha_service = CaptchaService(session)
            captcha_valid, captcha_msg = captcha_service.verify_captcha(captcha_id, captcha)
            
            if not captcha_valid:
                return web.json_response(
                    {'success': False, 'message': captcha_msg},
                    status=400
                )
            
            # 用户认证（不会自动创建用户）
            auth_service = AuthService(session)
            success, message, user = auth_service.authenticate(username, password)
            
            if success:
                # 登录成功
                user_id = user.id
                
                response = web.json_response({
                    'success': True,
                    'message': message,
                    'user': user.to_dict() if user else None,
                    'user_id': user_id
                })
                
                # 设置用户ID到cookie
                response.set_cookie('user_id', str(user_id), max_age=86400*30)
                response.set_cookie('comfy-user', str(user_id), max_age=86400*30)
                
                return response
            else:
                # 登录失败
                return web.json_response(
                    {'success': False, 'message': message},
                    status=401
                )
    
    except Exception as e:
        logging.error(f"登录失败: {str(e)}")
        return web.json_response(
            {'success': False, 'message': f'登录失败: {str(e)}'},
            status=500
        )


@ROUTES.post('/api/set_user')
async def set_user(request: web.Request) -> web.Response:
    """设置当前用户"""
    try:
        # 解析JSON请求体
        data = await request.json()
        user_id = data.get('user_id', '')
        
        if not user_id:
            return web.json_response(
                {'success': False, 'message': '用户ID不能为空'},
                status=400
            )
        
        # 设置用户会话（通过cookie和header）
        response = web.json_response({
            'success': True,
            'message': '用户设置成功',
            'user_id': user_id
        })
        
        # 设置用户ID到cookie
        response.set_cookie('user_id', str(user_id), max_age=86400*30)
        response.set_cookie('comfy-user', str(user_id), max_age=86400*30)
        
        return response
    
    except Exception as e:
        logging.error(f"设置用户失败: {str(e)}")
        return web.json_response(
            {'success': False, 'message': f'设置用户失败: {str(e)}'},
            status=500
        )


@ROUTES.post('/api/logout')
async def logout(request: web.Request) -> web.Response:
    """处理登出请求"""
    try:
        # 清除用户会话
        response = web.json_response({
            'success': True,
            'message': '登出成功',
            'redirect': '/login'
        })
        
        # 清除所有用户相关的cookie
        response.del_cookie('user_id')
        response.del_cookie('comfy-user')
        
        return response
    except Exception as e:
        logging.error(f"登出失败: {str(e)}")
        return web.json_response(
            {'success': False, 'message': f'登出失败: {str(e)}'},
            status=500
        )

@ROUTES.get('/logout')
async def logout_page(request: web.Request) -> web.Response:
    """登出页面 - 清除会话并重定向到登录页面"""
    response = web.Response(status=302, headers={'Location': '/login'})
    response.del_cookie('user_id')
    response.del_cookie('comfy-user')
    return response
