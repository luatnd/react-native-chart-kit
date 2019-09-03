import React from 'react'
import propTypes from 'prop-types'
import {View, TouchableWithoutFeedback} from 'react-native'
import {Svg, Rect, G} from 'react-native-svg'
import AbstractChart from './abstract-chart'


class BarChart extends AbstractChart {
  static props = {
    barWidth: propTypes.number,
    hozLinesCount: propTypes.number,
    // onChartClick: propTypes.func, // (x, y) => {}
  };

  state = {
    tooltipVisible: false,
    tooltipTextX: '',
    tooltipTextY: '',
    tooltipTargetIndex: 0,
    tooltipTargetValue: 0,
  };

  constructor(props) {
    super(props);

    /**
     * NOTE: This support only 1 lines
     * Have been sorted by `cx` props already
     */
    this.dataPoints = [
      // [index]: { index, value, cx, cy }
    ];
  }

  componentDidMount() {
    this.onRendered({});
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.onRendered(prevProps);
  }

  onRendered(prevProps) {
    // console.log('onRendered bar');
    const { data } = this.props;
    if (
      prevProps.data !== data &&
      data.datasets[0] &&
      data.datasets[0].data &&
      data.datasets[0].data.length > 0
    ) {
      this.props.onRendered && this.props.onRendered();
    }
  }

  renderBars = config => {
    const { barWidth = 6 } = this.props;

    const {
      dataset,
      width,
      height,
      paddingTop,
      paddingRight,
      onDataPointClick,
    } = config;

    const data = dataset.data;

    this.dataPoints = []; // reset data points
    const baseHeight = this.calcBaseHeight(data, height)
    const minData = Math.min(...data);
    const calcScaler = this.calcScaler(data);

    const dl = data.length;
    const itemSpace = (width - paddingRight) / dl;
    const extra = barWidth > 4 ? (4 + barWidth / 2) : barWidth / 2;

    return data.map((x, i) => {
      const barHeight = this.calcHeight(x, data, height);
      const cx = paddingRight + i * itemSpace; // + extra - (barWidth / 2) - 2; // 2 pixel for border
      const cy =
              (height / 4) *
              3 *
              (1 - (x - minData) / calcScaler)
              + paddingTop
              - 0;

      this.dataPoints[i] = { index: i, value: x, cx, cy, };

      const onPress = () => {
        const pointData = {
          value: x,
          indexY: i,
          dataset: dataset,
          getColor: opacity => '#fff',
          cx,
          cy,
        };

        if (onDataPointClick) {
          onDataPointClick(pointData)
        }

        /**
         * Click on data point will not trigger chart click,
         * So that we need to manually handle here
         */
        this.handleChartClick(cx, cy, dataset);
        // this.showDataPointTooltip(pointData);
      };

      return (
        <Rect
          key={Math.random()}
          x={
            // paddingRight +
            // (i * (width - paddingRight)) / data.length
            // + barWidth / 2
            cx - barWidth / 2
          }
          y={
            ((barHeight > 0 ? baseHeight - barHeight : baseHeight) / 4) * 3 +
            paddingTop
          }
          width={barWidth}
          height={(Math.abs(barHeight) / 4) * 3}
          // fill="url(#fillShadowGradient)"
          fill={this.props.chartConfig.graphColor(0.6)}
          onPress={onPress}
        />
      )
    })
  }

  renderBarTops = config => {
    const { barWidth = 6 } = this.props;

    const {data, width, height, paddingTop, paddingRight} = config
    const baseHeight = this.calcBaseHeight(data, height)
    const dl = data.length;
    const itemSpace = (width - paddingRight) / dl;

    return data.map((x, i) => {
      const barHeight = this.calcHeight(x, data, height)
      const cx = paddingRight + i * itemSpace;

      return (
        <Rect
          key={Math.random()}
          x={
            // paddingRight +
            // (i * (width - paddingRight)) / data.length +
            // barWidth / 2
            cx - barWidth / 2
          }
          y={((baseHeight - barHeight) / 4) * 3 + paddingTop}
          width={barWidth}
          height={2}
          fill={this.props.chartConfig.graphColor(0.6)}
        />
      )
    })
  }

  render() {
    const paddingTop = 16
    const paddingRight = 64
    const {
      width, height, data, style = {},
      barWidth = 6,
      hozLinesCount = 4,
      yLabelCount = 6,
      yLabelRenderer = () => '',
    } = this.props;

    const {borderRadius = 0} = style
    const config = {
      width,
      height
    }
    return (
      <View style={style}>
        <TouchableWithoutFeedback
          onPressIn={(e) => this.handleOnPressIn(e, data.datasets[0])}
        >
        <Svg height={height} width={width}>
          {this.renderDefs({
            ...config,
            ...this.props.chartConfig
          })}
          <Rect
            width="100%"
            height={height}
            rx={borderRadius}
            ry={borderRadius}
            fill="url(#backgroundGradient)"
          />
          <G>
            {this.renderHorizontalLines({
              ...config,
              count: hozLinesCount,
              paddingTop
            })}
          </G>
          <G>
            {this.renderHorizontalLabels({
              ...config,
              count: 4,
              data: data.datasets[0].data,
              paddingTop,
              paddingRight
            })}
          </G>
          <G>
            {this.renderVerticalLabelsAutomaticallyByDataPoint({
              ...config,
              dataset: data.datasets[0],
              yLabelCount,
              yLabelRenderer,
              paddingRight,
              paddingTop,
              horizontalOffset: barWidth
            })}
          </G>
          <G>
            {this.renderBars({
              ...config,
              dataset: data.datasets[0],
              paddingTop,
              paddingRight
            })}
          </G>
          <G>
            {this.renderBarTops({
              ...config,
              data: data.datasets[0].data,
              paddingTop,
              paddingRight
            })}
          </G>
          <G>
            {this.renderTooltipElement()}
          </G>
        </Svg>
        </TouchableWithoutFeedback>
      </View>
    )
  }


  showDataPointTooltip({ indexY, value, cx, cy, dataset, getColor }) {
    super.showDataPointTooltip({ index: indexY, value, cx, cy, dataset, getColor });

    const { getTooltipTextX, getTooltipTextY } = this.props;
    this.setState({
      tooltipVisible: true,
      tooltipTextX: getTooltipTextX ? getTooltipTextX(indexY, value, dataset) : '' + value,
      tooltipTextY: getTooltipTextY ? getTooltipTextY(indexY, value, dataset) : '' + value,
      tooltipTargetIndex: indexY,
      tooltipTargetValue: value,
    })
  }

  handleOnPressIn(e, firstDataset) {
    const nativeEvent = e.nativeEvent;
    this.handleChartClick(nativeEvent.locationX, nativeEvent.locationY, firstDataset)
  }

  handleChartClick(x, y, firstDataset) {
    const { width, height } = this.props;
    // console.log('{handleChartClick} width, height, x, y: ', width, height, x, y);

    // find nearest data point
    const closestPoint = this.binarySearchDataPoint(this.dataPoints, x, 0, this.dataPoints.length - 1);

    // show point tooltip
    this.showDataPointTooltip({
      indexY: closestPoint.index,
      value: closestPoint.value,
      cx: closestPoint.cx,
      cy: closestPoint.cy,
      dataset: firstDataset,
      getColor: () => {},
    });

    this.props.onChartClick && this.props.onChartClick(closestPoint.index, x, y);
  }

  handleChartClickByIndex(index, x, y, firstDataset) {
    // find nearest data point
    const closestPoint = this.dataPoints[index];
    if (!closestPoint) {
      return;
    }

    // show point tooltip
    this.showDataPointTooltip({
      indexY: closestPoint.index,
      value: closestPoint.value,
      cx: closestPoint.cx,
      cy: closestPoint.cy,
      dataset: firstDataset,
      getColor: () => {},
    });
  }

  binarySearchDataPoint(arr, target, start, end) {
    const m = Math.floor((start + end)/2);

    if (target == arr[m].cx) return arr[m];
    if (start >= end) return arr[start];
    if (end - 1 === start) return Math.abs(arr[start].cx - target) > Math.abs(arr[end].cx - target) ? arr[end] : arr[start];
    if (target > arr[m].cx) return this.binarySearchDataPoint(arr, target, m, end);
    if (target < arr[m].cx) return this.binarySearchDataPoint(arr, target, start, m);
  }
}

export default BarChart
