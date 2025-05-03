import numpy as np
import matplotlib.pyplot as plt

# 假设数据，您需要用真实数据替换这些
# 这里只是示范如何设置子图和图表
times = np.linspace(0, 60, 600)  # 生成时间轴数据
data_mocap = np.sin(2 * np.pi * times / 60)  # 模拟的Motion Capture数据
data_ekf = data_mocap + np.random.normal(0, 0.1, size=times.shape)  # 模拟的EKF数据

# 计算误差
error = data_mocap - data_ekf

# 创建子图
fig, axs = plt.subplots(3, 2, figsize=(15, 5))

# 位置子图
axs[0, 0].plot(times, data_mocap,label='Mocap')
axs[0, 0].plot(times, data_ekf, label='EKF')
axs[0, 1].plot(times, error, label='Error', color='orange')
axs[0, 0].set_title('Position')
axs[0, 1].set_title('Position Error')

# 方向子图
# 这里应该使用方向数据，例如四元数或欧拉角，这里只是为了示例
axs[1, 0].plot(times, data_mocap, label='Mocap')
axs[1, 0].plot(times, data_ekf, label='EKF')
axs[1, 1].plot(times, error, label='Error', color='orange')
axs[1, 0].set_title('Orientation')
axs[1, 1].set_title('Orientation Error')

# 速度子图
# 这里应该使用速度数据，这里只是为了示例
axs[2, 0].plot(times, data_mocap, label='Mocap')
axs[2, 0].plot(times, data_ekf, label='EKF')
axs[2, 1].plot(times, error, label='Error', color='orange')
axs[2, 0].set_title('Velocity')
axs[2, 1].set_title('Velocity Error')

# 添加图例
for ax_row in axs:
    for ax in ax_row:
        ax.legend()

# 调整布局
plt.tight_layout()

# 显示图表
plt.show()
