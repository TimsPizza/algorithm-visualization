import { Visualizer, VISUALIZER_TYPES } from "./types";

// 辅助函数：生成热力图颜色
const getHeatColor = (value: number): string => {
  // 从蓝色到红色的渐变
  const hue = (1 - value) * 240; // 240 (blue) -> 0 (red)
  return `hsl(${hue}, 100%, 50%)`;
};

// 经典柱状图绘制器
export const BarVisualizer: Visualizer = {
  name: VISUALIZER_TYPES.CLASSIC_BARS,
  description: "classical bar chart",
  draw: ({
    ctx,
    width,
    height,
    array,
    highlightIndices,
    highlightColor,
    defaultColor,
    sortedColor,
    isSorted,
  }) => {
    // 根据数组大小动态调整柱状图宽度和间距
    const maxBars = width / 2; // 确保至少2像素宽度
    const scale = array.length > maxBars ? maxBars / array.length : 1;
    const barWidth = Math.max(2, Math.min(10, (width * 0.8 / array.length) * scale));
    const barSpacing = Math.max(0, Math.min(barWidth * 0.2, 2));
    const totalWidth = (barWidth + barSpacing) * array.length;
    const startX = (width - totalWidth) / 2;

    array.forEach((value, index) => {
      const x = startX + index * (barWidth + barSpacing);
      const h = value * height * 0.8;
      const y = height - h;

      ctx.fillStyle = isSorted
        ? sortedColor
        : highlightIndices.includes(index)
          ? highlightColor
          : defaultColor;

      ctx.fillRect(x, y, barWidth, h);
    });
  },
};

// 圆形展示器
export const CircleVisualizer: Visualizer = {
  name: VISUALIZER_TYPES.CIRCLE_VIEW,
  description: "circle view",
  draw: ({
    ctx,
    width,
    height,
    array,
    highlightIndices,
    highlightColor,
    defaultColor,
    sortedColor,
    isSorted,
  }) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.5;
    const angleStep = (2 * Math.PI) / array.length;

    array.forEach((value, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const barHeight = value * radius;

      const startX = centerX + Math.cos(angle) * radius;
      const startY = centerY + Math.sin(angle) * radius;
      const endX = centerX + Math.cos(angle) * (radius - barHeight);
      const endY = centerY + Math.sin(angle) * (radius - barHeight);

      ctx.strokeStyle = isSorted
        ? sortedColor
        : highlightIndices.includes(index)
          ? highlightColor
          : defaultColor;

      ctx.lineWidth = Math.max(1, 360 / array.length);
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    });
  },
};

// 网格视图绘制器
export const GridVisualizer: Visualizer = {
  name: VISUALIZER_TYPES.GRID_VIEW,
  description: "grid view",
  draw: ({
    ctx,
    width,
    height,
    array,
    highlightIndices,
    highlightColor,
    defaultColor,
    sortedColor,
    isSorted,
  }) => {
    const gridSize = Math.ceil(Math.pow(array.length, 0.5));
    const cellSize = Math.min(width, height) / gridSize;
    const startX = (width - cellSize * gridSize) / 2;
    const startY = (height - cellSize * gridSize) / 2;

    array.forEach((value, index) => {
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;
      const x = startX + col * cellSize;
      const y = startY + row * cellSize;
      if (highlightIndices.includes(index)) {
        ctx.fillStyle = highlightColor;
      } else {
        const brightness = Math.floor(value * 100);
        ctx.fillStyle = `hsl(220, 70%, ${brightness}%)`;
      }

      ctx.fillRect(x, y, cellSize - 2, cellSize - 2);
    });
  },
};

// 径向视图绘制器
export const RadialVisualizer: Visualizer = {
  name: VISUALIZER_TYPES.RADIAL_VIEW,
  description: "radial view",
  draw: ({
    ctx,
    width,
    height,
    array,
    highlightIndices,
    highlightColor,
    defaultColor,
    sortedColor,
    isSorted,
  }) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.5;
    const angleStep = (2 * Math.PI) / array.length;

    ctx.lineWidth = Math.max(2, 360 / array.length);

    array.forEach((value, index) => {
      const angle = index * angleStep;
      const length = value * radius;

      const x = centerX + Math.cos(angle) * length;
      const y = centerY + Math.sin(angle) * length;

      if (highlightIndices.includes(index)) {
        ctx.strokeStyle = highlightColor;
      } else {
        ctx.strokeStyle = `hsl(${value * 360}, 70%, 50%)`;
      }

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();
    });
  },
};

// 粒子效果绘制器
export const ParticleVisualizer: Visualizer = {
  name: VISUALIZER_TYPES.PARTICLE_VIEW,
  description: "particle view",
  draw: ({
    ctx,
    width,
    height,
    array,
    highlightIndices,
    highlightColor,
    defaultColor,
    sortedColor,
    isSorted,
  }) => {
    const startX = width * 0.1;
    const endX = width * 0.9;
    const barWidth = (endX - startX) / array.length;

    array.forEach((value, index) => {
      const x = startX + index * barWidth;
      const y = height * (1 - value);
      const particleSize = Math.max(4, Math.min(12, 400 / array.length));

      if (isSorted) {
        ctx.fillStyle = sortedColor;
      } else if (highlightIndices.includes(index)) {
        ctx.fillStyle = highlightColor;
      } else {
        ctx.fillStyle = defaultColor;
      }

      // 绘制粒子
      ctx.beginPath();
      ctx.arc(x + barWidth / 2, y, particleSize, 0, Math.PI * 2);
      ctx.fill();

      // 绘制连接线
      if (index > 0) {
        const prevX = startX + (index - 1) * barWidth + barWidth / 2;
        const prevY = height * (1 - array[index - 1]);

        ctx.beginPath();
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = 1;
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x + barWidth / 2, y);
        ctx.stroke();
      }
    });
  },
};

// 热力柱状图绘制器
export const HeatBarVisualizer: Visualizer = {
  name: VISUALIZER_TYPES.HEAT_BAR,
  description: "结合柱状图和热力图，使用温度色带表示值",
  draw: ({
    ctx,
    width,
    height,
    array,
    highlightIndices,
    highlightColor,
    defaultColor,
    sortedColor,
    isSorted,
  }) => {
    // 适应大数组的动态缩放
    const maxBars = width / 2;
    const scale = array.length > maxBars ? maxBars / array.length : 1;
    const barWidth = Math.max(2, Math.min(30, (width * 0.8 / array.length) * scale));
    const barSpacing = Math.max(0, Math.min(barWidth * 0.2, 2));
    const totalWidth = (barWidth + barSpacing) * array.length;
    const startX = (width - totalWidth) / 2;

    array.forEach((value, index) => {
      const x = startX + index * (barWidth + barSpacing);
      const h = value * height * 0.8;
      const y = height - h;

      if (highlightIndices.includes(index)) {
        ctx.fillStyle = highlightColor;
      } else {
        ctx.fillStyle = getHeatColor(value);
      }

      ctx.fillRect(x, y, barWidth, h);
    });
  },
};

// 波形图绘制器
export const WaveformVisualizer: Visualizer = {
  name: VISUALIZER_TYPES.WAVEFORM,
  description: "音频波形风格的展示方式",
  draw: ({
    ctx,
    width,
    height,
    array,
    highlightIndices,
    highlightColor,
    defaultColor,
    sortedColor,
    isSorted,
  }) => {
    const centerY = height / 2;
    const barWidth = Math.max(1, Math.min(10, (width * 0.8) / array.length));
    const spacing = barWidth * 1.2;
    const startX = (width - spacing * array.length) / 2;

    array.forEach((value, index) => {
      const x = startX + index * spacing;
      const barHeight = value * height * 0.4;

      ctx.strokeStyle = isSorted
        ? sortedColor
        : highlightIndices.includes(index)
          ? highlightColor
          : defaultColor;

      ctx.lineWidth = barWidth;
      ctx.beginPath();
      ctx.moveTo(x, centerY - barHeight);
      ctx.lineTo(x, centerY + barHeight);
      ctx.stroke();
    });
  },
};

// 导出所有可视化器
export const visualizers: Record<string, Visualizer> = {
  [VISUALIZER_TYPES.CLASSIC_BARS]: BarVisualizer,
  [VISUALIZER_TYPES.CIRCLE_VIEW]: CircleVisualizer,
  [VISUALIZER_TYPES.GRID_VIEW]: GridVisualizer,
  [VISUALIZER_TYPES.RADIAL_VIEW]: RadialVisualizer,
  [VISUALIZER_TYPES.PARTICLE_VIEW]: ParticleVisualizer,
  [VISUALIZER_TYPES.HEAT_BAR]: HeatBarVisualizer,
  [VISUALIZER_TYPES.WAVEFORM]: WaveformVisualizer,
};
