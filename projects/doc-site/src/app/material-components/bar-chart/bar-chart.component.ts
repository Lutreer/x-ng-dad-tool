import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ElementRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { X_BLOCK_DATA_SOURCE_KEY, XBlockRegister } from '../../../../../x-block/src/public-api';
import { JSONSchema7 } from 'json-schema';
import * as echarts from 'echarts';
import jsonpath from 'jsonpath';

@XBlockRegister({
  key: 'crx-block-bar-chart',
  name: '可配置柱状图',
  thumbnail: './assets/bar-chart.png',
  resizeable: {
    widthResize: true,
    defaultWidth: 600,
    heightResize: true,
    defaultHeight: 400,
  },
  propsSchema: {
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    required: ['xAxis', 'series'],
    title: '柱状图配置',
    description: '配置柱状图的X轴、Y轴和数据',
    properties: {
      title: {
        type: 'string',
        title: '图表标题',
        default: '柱状图示例',
      },

      data: {
        type: 'array',
        title: '数据配置',
        items: {
          type: 'object',
          required: ['title', 'xname', 'xpath'],
          properties: {
            title: { type: 'string', title: '数据类别名' },
            namePath: { type: 'string', title: '数据名Json path' },
            valuePath: { type: 'string', title: '数据值Json path' },
          },
        },
        default: [
          {
            title: '类别A',
            data: [{ title: '类比1', namePath: '$..StationCode', valuePath: '$..PowerGeneration' }],
          },
        ],
      },
    },
  } as JSONSchema7,
})
@Component({
  selector: 'crx-block-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss'],
})
export class BarChartComponent implements OnChanges, OnInit, OnDestroy {
  @Input() title: string = '柱状图示例';
  @Input() data: { title: string; namePath: string; valuePath: string }[] = [];
  @Input(X_BLOCK_DATA_SOURCE_KEY) dataSource: any[] = [];

  private chart: echarts.ECharts | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    this.initChart();
    this.setupResizeObserver();
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.dispose();
      this.chart = null;
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private setupResizeObserver() {
    const chartContainer = this.elementRef.nativeElement.querySelector('.chart-container');
    if (!chartContainer) return;

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === chartContainer) {
          this.resizeChart();
          break;
        }
      }
    });

    // 观察图表容器
    this.resizeObserver.observe(chartContainer);
  }

  private resizeChart() {
    if (this.chart) {
      // 确保在下一个渲染周期执行resize
      requestAnimationFrame(() => {
        this.chart?.resize();
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.chart) {
      this.updateChart();
    }
  }

  private initChart() {
    const chartDom = this.elementRef.nativeElement.querySelector('.chart-container');
    this.chart = echarts.init(chartDom, 'dark');
    this.updateChart();
  }

  private updateChart() {
    if (!this.chart) return;
    let option: echarts.EChartsOption = {};
    try {
      option = {
        backgroundColor: 'transparent',
        title: { text: this.title },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        legend: {
          data: this.data.map((s) => s.title),
          top: 30,
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: jsonpath.query(this.dataSource, this.data[0].namePath),
          axisTick: {
            alignWithLabel: true,
          },
        },
        yAxis: {
          type: 'value',
        },
        series: this.data?.map((s) => ({
          name: s.title,
          type: 'bar',
          data: jsonpath.query(this.dataSource, s.valuePath),
          emphasis: {
            focus: 'series',
          },
        })),
      };
    } catch (error) {
      option = {
        title: { text: '示例(请先配置数据)' },
      };
    }

    this.chart.setOption(option);
  }
}
