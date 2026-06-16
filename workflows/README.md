# ComfyUI 工作流文件

此目录包含ComfyUI的工作流文件，已添加到git版本管理。

## 当前工作流文件

### 1. `2tu_flux2.json`
- **类型**: Flux 2图像生成工作流
- **用途**: 使用Flux 2模型进行文本到图像生成
- **大小**: 51KB

### 2. `video_wan2.json`
- **类型**: Wan 2.2图生视频工作流
- **用途**: 使用Wan 2.2模型进行图像到视频生成
- **大小**: 46KB
- **依赖**: 需要Wan 2.2模型文件

## 使用说明

1. **加载工作流**: 在ComfyUI Web界面中点击"Load"按钮，选择对应的工作流文件
2. **模型依赖**: 确保相应的模型文件已放置在正确的目录中
   - Flux模型: `models/diffusion_models/`
   - Wan模型: `models/diffusion_models/` 和 `models/loras/`
3. **工作流备份**: 所有工作流文件都通过git进行版本管理

## 添加新工作流

1. 将工作流文件保存到 `workflows/` 目录
2. 使用 `git add workflows/文件名.json` 添加到git
3. 使用 `git commit -m "添加新工作流: 描述"` 提交更改

## 注意事项

- 工作流文件可能包含模型路径引用，请根据实际环境调整
- 大型模型文件（.safetensors, .ckpt等）不应添加到git中
- 用户数据（如生成的结果）应保存在 `output/` 目录中

