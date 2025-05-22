#!/usr/bin/env python3
import os
from PIL import Image
import piexif
from tqdm import tqdm

def auto_rotate_image(image_path):
    """自动旋转图片到正确方向"""
    try:
        image = Image.open(image_path)
        
        # 检查是否有EXIF数据
        try:
            exif = image._getexif()
        except:
            exif = None
            
        if exif is not None:
            orientation = exif.get(274)  # 274是方向标签的ID
            if orientation is not None:
                # 根据EXIF方向信息旋转图片
                if orientation == 3:
                    image = image.rotate(180, expand=True)
                elif orientation == 6:
                    image = image.rotate(270, expand=True)
                elif orientation == 8:
                    image = image.rotate(90, expand=True)
                
                # 保存图片并删除EXIF信息
                image_without_exif = Image.new(image.mode, image.size)
                image_without_exif.putdata(list(image.getdata()))
                image_without_exif.save(image_path, quality=95)
                print(f"已修正: {image_path}")
            else:
                print(f"无需修正: {image_path}")
        else:
            print(f"无EXIF数据: {image_path}")
            
    except Exception as e:
        print(f"处理 {image_path} 时出错: {str(e)}")

def process_directory(directory):
    """处理指定目录下的所有图片"""
    # 支持的图片格式
    image_extensions = ('.jpg', '.jpeg', '.png', '.gif', '.bmp')
    
    # 获取所有图片文件
    image_files = []
    for root, _, files in os.walk(directory):
        for file in files:
            if file.lower().endswith(image_extensions):
                image_files.append(os.path.join(root, file))
    
    print(f"找到 {len(image_files)} 个图片文件")
    
    # 使用进度条处理所有图片
    for image_path in tqdm(image_files, desc="处理图片"):
        auto_rotate_image(image_path)

if __name__ == "__main__":
    # 获取当前目录
    current_dir = os.getcwd()
    
    print("图片旋转修正工具")
    print("================")
    print(f"当前目录: {current_dir}")
    
    # 询问用户是否处理当前目录
    response = input("是否处理当前目录下的所有图片？(y/n): ")
    
    if response.lower() == 'y':
        process_directory(current_dir)
    else:
        # 让用户输入目录路径
        directory = input("请输入要处理的图片目录路径: ")
        if os.path.exists(directory):
            process_directory(directory)
        else:
            print("目录不存在！") 