type VisualizerContext = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  array: number[];
  highlightIndices: number[];
  highlightColor: string;
  defaultColor: string;
  sortedColor: string;
  isSorted: boolean;
};

// 基础绘制器接口
interface Visualizer {
  draw: (context: VisualizerContext) => void;
  name: string;
  description: string;
}

// 1. 经典条形图绘制器
export const BarVisualizer: Visualizer = {
  name: "Classic Bars",
  description: "传统的条形图展示，高度代表数值大小",
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
    const barWidth = Math.max(2, Math.min(30, (width * 0.8) / array.length));
    const barSpacing = Math.max(1, barWidth * 0.2);
    const startX = (width - (barWidth + barSpacing) * array.length) / 2;

    array.forEach((value, index) => {
      const x = startX + index * (barWidth + barSpacing);
      const h = value * height * 0.8;
      const y = height - h;

      if (isSorted) {
        ctx.fillStyle = sortedColor;
      } else if (highlightIndices.includes(index)) {
        ctx.fillStyle = highlightColor;
      } else {
        ctx.fillStyle = defaultColor;
      }

      ctx.fillRect(x, y, barWidth, h);
    });
  },
};

// 2. 圆形展示器
export const CircleVisualizer: Visualizer = {
  name: "Circle View",
  description: "以圆形方式展示数组，每个元素在圆周上，高度向圆心延伸",
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
    const radius = Math.min(width, height) * 0.4;
    const angleStep = (2 * Math.PI) / array.length;

    array.forEach((value, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const barHeight = value * radius;

      const startX = centerX + Math.cos(angle) * radius;
      const startY = centerY + Math.sin(angle) * radius;
      const endX = centerX + Math.cos(angle) * (radius - barHeight);
      const endY = centerY + Math.sin(angle) * (radius - barHeight);

      if (isSorted) {
        ctx.strokeStyle = sortedColor;
      } else if (highlightIndices.includes(index)) {
        ctx.strokeStyle = highlightColor;
      } else {
        ctx.strokeStyle = defaultColor;
      }

      ctx.lineWidth = Math.max(2, 360 / array.length);
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    });
  },
};

// 3. 散点图绘制器
export const ScatterVisualizer: Visualizer = {
  name: "Scatter Plot",
  description: "散点图展示，位置代表数值，形成渐变排序效果",
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
    const padding = 50;
    const plotWidth = width - 2 * padding;
    const plotHeight = height - 2 * padding;
    const dotSize = Math.max(3, Math.min(15, 500 / array.length));

    array.forEach((value, index) => {
      const x = padding + (index / (array.length - 1)) * plotWidth;
      const y = height - (padding + value * plotHeight);

      if (isSorted) {
        ctx.fillStyle = sortedColor;
      } else if (highlightIndices.includes(index)) {
        ctx.fillStyle = highlightColor;
      } else {
        ctx.fillStyle = defaultColor;
      }

      ctx.beginPath();
      ctx.arc(x, y, dotSize, 0, 2 * Math.PI);
      ctx.fill();

      // 绘制连接线
      if (index > 0) {
        const prevX = padding + ((index - 1) / (array.length - 1)) * plotWidth;
        const prevY = height - (padding + array[index - 1] * plotHeight);

        ctx.beginPath();
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = 1;
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    });
  },
};

// 4. 螺旋展示器
export const SpiralVisualizer: Visualizer = {
  name: "Spiral View",
  description: "螺旋形展示，形成独特的视觉效果",
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
    const maxRadius = Math.min(width, height) * 0.45;
    const spiralSpacing = maxRadius / array.length;

    array.forEach((value, index) => {
      const angle = (index / array.length) * Math.PI * 8;
      const radius = spiralSpacing * index;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      const size = value * 20 + 2;

      if (isSorted) {
        ctx.fillStyle = sortedColor;
      } else if (highlightIndices.includes(index)) {
        ctx.fillStyle = highlightColor;
      } else {
        ctx.fillStyle = defaultColor;
      }

      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
    });
  },
};

// 5. 波形图绘制器
export const WaveformVisualizer: Visualizer = {
  name: "Waveform",
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

      if (isSorted) {
        ctx.strokeStyle = sortedColor;
      } else if (highlightIndices.includes(index)) {
        ctx.strokeStyle = highlightColor;
      } else {
        ctx.strokeStyle = defaultColor;
      }

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
  "Classic Bars": BarVisualizer,
  "Circle View": CircleVisualizer,
  "Scatter Plot": ScatterVisualizer,
  "Spiral View": SpiralVisualizer,
  Waveform: WaveformVisualizer,
};
