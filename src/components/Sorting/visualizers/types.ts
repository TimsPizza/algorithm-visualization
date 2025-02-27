export type VisualizerContext = {
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

export interface Visualizer {
  draw: (context: VisualizerContext) => void;
  name: string;
  description: string;
}

// 可视化器类型定义
export const VISUALIZER_TYPES = {
  CLASSIC_BARS: "Classic Bars", // 经典柱状图
  CIRCLE_VIEW: "Circle View", // 圆形展示
  GRID_VIEW: "Grid View", // 网格视图
  RADIAL_VIEW: "Radial View", // 径向视图
  PARTICLE_VIEW: "Particle View", // 粒子效果
  STAR_TRAIL: "Star Trail", // 星轨粒子
  HEAT_BAR: "Heat Bar", // 柱状热力图
  WAVEFORM: "Waveform", // 波形图
} as const;

export type VisualizerType =
  (typeof VISUALIZER_TYPES)[keyof typeof VISUALIZER_TYPES];

// 可视化器配置数组
export const VISUALIZER_OPTIONS = [
  {
    type: VISUALIZER_TYPES.CLASSIC_BARS,
    label: "classic_bars",
    description: "传统的条形图展示，高度代表数值大小",
  },
  {
    type: VISUALIZER_TYPES.CIRCLE_VIEW,
    label: "circle_view",
    description: "以圆形方式展示数组，每个元素在圆周上，高度向圆心延伸",
  },
  {
    type: VISUALIZER_TYPES.GRID_VIEW,
    label: "grid_view",
    description: "将数组展示为二维网格，颜色深浅表示值的大小",
  },
  {
    type: VISUALIZER_TYPES.RADIAL_VIEW,
    label: "radial_view",
    description: "将数组元素呈放射状排列，颜色和长度双重表示值",
  },
  {
    type: VISUALIZER_TYPES.PARTICLE_VIEW,
    label: "particle_view",
    description: "每个元素表示为运动的粒子，高度表示值的大小",
  },
  {
    type: VISUALIZER_TYPES.HEAT_BAR,
    label: "heat_bar",
    description: "结合柱状图和热力图，使用温度色带表示值",
  },
  {
    type: VISUALIZER_TYPES.WAVEFORM,
    label: "waveform",
    description: "音频波形风格的展示方式",
  },
] as const;
