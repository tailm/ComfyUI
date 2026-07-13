import uuid
import random
import string
from datetime import datetime, timedelta
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.user_models import CaptchaSession


class CaptchaService:
    """验证码服务类"""
    
    # 验证码配置
    CAPTCHA_LENGTH = 4  # 验证码长度
    CAPTCHA_EXPIRE_MINUTES = 5  # 验证码有效期（分钟）
    IMAGE_WIDTH = 120  # 图片宽度
    IMAGE_HEIGHT = 40  # 图片高度
    
    def __init__(self, session: Session):
        self.session = session
    
    def generate_captcha_text(self) -> str:
        """生成随机验证码文本
        
        Returns:
            str: 4位随机字母数字组合
        """
        # 使用大写字母和数字，排除容易混淆的字符（O, 0, I, 1, L）
        chars = string.ascii_uppercase + string.digits
        chars = chars.replace('O', '').replace('0', '').replace('I', '').replace('1', '').replace('L', '')
        captcha_text = ''.join(random.choices(chars, k=self.CAPTCHA_LENGTH))
        return captcha_text
    
    def generate_captcha_image(self, text: str) -> bytes:
        """生成验证码图片
        
        Args:
            text: 验证码文本
            
        Returns:
            bytes: PNG格式的图片字节流
        """
        # 创建白色背景图片
        image = Image.new('RGB', (self.IMAGE_WIDTH, self.IMAGE_HEIGHT), color='white')
        draw = ImageDraw.Draw(image)
        
        # 尝试使用系统字体，如果失败则使用默认字体
        try:
            # 尝试使用常见的系统字体
            font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 24)
        except (OSError, IOError):
            try:
                # 尝试其他常见字体路径
                font = ImageFont.truetype('arial.ttf', 24)
            except (OSError, IOError):
                # 使用默认字体
                font = ImageFont.load_default()
        
        # 计算文本位置（居中）
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        x = (self.IMAGE_WIDTH - text_width) // 2
        y = (self.IMAGE_HEIGHT - text_height) // 2
        
        # 绘制文本
        draw.text((x, y), text, fill='black', font=font)
        
        # 添加干扰线（3条）
        for _ in range(3):
            x1 = random.randint(0, self.IMAGE_WIDTH)
            y1 = random.randint(0, self.IMAGE_HEIGHT)
            x2 = random.randint(0, self.IMAGE_WIDTH)
            y2 = random.randint(0, self.IMAGE_HEIGHT)
            draw.line([(x1, y1), (x2, y2)], fill='gray', width=1)
        
        # 添加噪点（100个）
        for _ in range(100):
            x = random.randint(0, self.IMAGE_WIDTH - 1)
            y = random.randint(0, self.IMAGE_HEIGHT - 1)
            draw.point((x, y), fill='gray')
        
        # 转换为字节流
        buffer = BytesIO()
        image.save(buffer, format='PNG')
        return buffer.getvalue()
    
    def create_captcha_session(self) -> tuple[str, bytes]:
        """创建验证码会话
        
        Returns:
            tuple[str, bytes]: (captcha_id, 图片数据)
        """
        # 生成UUID作为captcha_id
        captcha_id = str(uuid.uuid4())
        
        # 生成验证码文本
        captcha_text = self.generate_captcha_text()
        
        # 计算过期时间
        expires_at = datetime.utcnow() + timedelta(minutes=self.CAPTCHA_EXPIRE_MINUTES)
        
        # 创建CaptchaSession记录
        captcha_session = CaptchaSession(
            id=captcha_id,
            captcha_text=captcha_text,
            created_at=datetime.utcnow(),
            expires_at=expires_at,
            is_used=False
        )
        
        # 保存到数据库
        self.session.add(captcha_session)
        self.session.commit()
        
        # 生成验证码图片
        image_data = self.generate_captcha_image(captcha_text)
        
        return captcha_id, image_data
    
    def verify_captcha(self, captcha_id: str, user_input: str) -> tuple[bool, str]:
        """验证验证码
        
        Args:
            captcha_id: 验证码ID
            user_input: 用户输入的验证码
            
        Returns:
            tuple[bool, str]: (是否验证成功, 消息)
        """
        # 查询CaptchaSession记录
        stmt = select(CaptchaSession).where(CaptchaSession.id == captcha_id)
        result = self.session.execute(stmt)
        captcha_session = result.scalar_one_or_none()
        
        # 检查验证码是否存在
        if not captcha_session:
            return False, "验证码不存在"
        
        # 检查是否已使用
        if captcha_session.is_used:
            return False, "验证码已使用"
        
        # 检查是否过期
        if datetime.utcnow() > captcha_session.expires_at:
            return False, "验证码已过期"
        
        # 检查是否匹配（不区分大小写）
        if user_input.upper() != captcha_session.captcha_text.upper():
            return False, "验证码错误"
        
        # 标记为已使用
        captcha_session.is_used = True
        self.session.commit()
        
        return True, "验证码正确"
    
    def cleanup_expired_captchas(self) -> int:
        """清理过期的验证码会话
        
        Returns:
            int: 删除的记录数
        """
        # 查询过期的验证码
        stmt = select(CaptchaSession).where(
            CaptchaSession.expires_at < datetime.utcnow()
        )
        result = self.session.execute(stmt)
        expired_captchas = result.scalars().all()
        
        # 删除过期记录
        count = len(expired_captchas)
        for captcha in expired_captchas:
            self.session.delete(captcha)
        
        if count > 0:
            self.session.commit()
        
        return count
