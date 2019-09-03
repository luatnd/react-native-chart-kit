import React, {Component} from 'react'
// import propTypes from 'prop-types'

import {LinearGradient, Line, Text, Defs, Stop} from 'react-native-svg'
import TooltipDecorator from './chart-decorators/tooltip'

class AbstractChart extends Component {
  // static props = {
  //   yAxisLabelVisible: propTypes.bool,
  //   renderTooltip: propTypes.func,
  //   getTooltipTextX: propTypes.func, // (index, value, dataset) => text
  //   getTooltipTextY: propTypes.func, // (index, value, dataset) => text
  //   onChartClick: propTypes.func, // (x, y) => {}
  //   onRendered: propTypes.func, // () => {}: On chart was rendered
  // };

  /**
   * For tooltip position calculation
   */
  cx = 0;
  cy = 0;

  calcScaler = data => {
    if (this.props.fromZero) {
      return Math.max(...data, 0) - Math.min(...data, 0) || 1
    } else {
      return Math.max(...data) - Math.min(...data) || 1
    }
  }

  calcBaseHeight = (data, height) => {
    const min = Math.min(...data)
    const max = Math.max(...data)
    if (min >= 0 && max >= 0) {
      return height
    } else if (min < 0 && max <= 0) {
      return 0
    } else if (min < 0 && max > 0) {
      return height * max / this.calcScaler(data)
    }
  }

  calcHeight = (val, data, height) => {
    const max = Math.max(...data)
    const min = Math.min(...data)
    if (min < 0 && max > 0) {
       return height * (val / this.calcScaler(data))
    } else if (min >= 0 && max >= 0) {
      return this.props.fromZero ?
        height * (val / this.calcScaler(data)) :
        height * ((val - min) / this.calcScaler(data))
    } else if (min < 0 && max <= 0) {
      return this.props.fromZero ?
        height * (val / this.calcScaler(data)) :
        height * ((val - max) / this.calcScaler(data))
    }
  }

  renderHorizontalLines = config => {
    const {count, width, height, paddingTop, paddingRight} = config
    return [...new Array(count)].map((_, i) => {
      return (
        <Line
          key={Math.random()}
          x1={paddingRight}
          y1={(height / 4) * i + paddingTop}
          x2={width}
          y2={(height / 4) * i + paddingTop}
          stroke={this.props.chartConfig.color(0.2)}
          strokeDasharray="5, 10"
          strokeWidth={1}
        />
      )
    })
  }

  renderHorizontalLine = config => {
    const {width, height, paddingTop, paddingRight} = config
    return (
      <Line
        key={Math.random()}
        x1={paddingRight}
        y1={height - height / 4 + paddingTop}
        x2={width}
        y2={height - height / 4 + paddingTop}
        stroke={this.props.chartConfig.color(0.2)}
        strokeDasharray="5, 10"
        strokeWidth={1}
      />
    )
  }

  renderHorizontalLabels = config => {
    const {
      count,
      data,
      height,
      paddingTop,
      paddingRight,
      yLabelsOffset = 12
    } = config
    const decimalPlaces = this.props.chartConfig.decimalPlaces === undefined ? 2 : this.props.chartConfig.decimalPlaces
    const yAxisLabel = this.props.yAxisLabel || ''

    return [...new Array(count)].map((_, i) => {
      let yLabel

      if (count === 1) {
        yLabel = `${yAxisLabel}${data[0].toFixed(decimalPlaces)}`
      } else {
        const label = this.props.fromZero ?
          (this.calcScaler(data) / (count - 1)) * i + Math.min(...data, 0) :
          (this.calcScaler(data) / (count - 1)) * i + Math.min(...data)
        yLabel = `${yAxisLabel}${label.toFixed(decimalPlaces)}`
      }

      return (
        <Text
          key={Math.random()}
          x={paddingRight - yLabelsOffset}
          textAnchor="end"
          y={(height * 3) / 4 - ((height - paddingTop) / count) * i + 12}
          fontSize={12}
          fill={this.props.chartConfig.color(0.5)}
        >
          {yLabel}
        </Text>
      )
    })
  }

  renderVerticalLabels = config => {
    const {
      labels = [],
      width,
      height,
      paddingRight,
      paddingTop,
      horizontalOffset = 0,
      stackedBar = false
    } = config
    const fontSize = 12
    let fac = 1
    if (stackedBar) {
      fac = 0.71
    }

    return labels.map((label, i) => {
      return (
        <Text
          key={Math.random()}
          x={
            (((width - paddingRight) / labels.length) * i +
              paddingRight +
              horizontalOffset) *
            fac
          }
          y={(height * 3) / 4 + paddingTop + fontSize * 2}
          fontSize={fontSize}
          fill={this.props.chartConfig.color(0.5)}
          textAnchor="middle"
        >
          {label}
        </Text>
      )
    })
  }

  renderVerticalLabelsAutomatically = config => {
    const {
      dataset,
      yLabelCount,
      yLabelRenderer,
      width,
      height,
      paddingRight,
      paddingTop,
      horizontalOffset = 0,
      stackedBar       = false
    } = config;

    const fontSize = 12
    let fac = 1
    if (stackedBar) {
      fac = 0.71
    }

    const data = dataset.data;
    const pointLabels = dataset.labels;
    const itemSpace = (width - paddingRight) / data.length;

    /**
     * Get 6 top label only
     */
    let labels = [];
    let minVal = pointLabels[0];
    let maxVal = pointLabels[pointLabels.length - 1];
    const labelCount = yLabelCount;
    let step = (maxVal - minVal) / labelCount;
    let cx = 0;

    let lastPosition = -1;
    for (let i = 0; i < labelCount; i++) {
      const unPositionedVal = minVal + Math.floor(i * step);
      let displayVal = '';

      for (let j = lastPosition + 1, c = pointLabels.length; j < c; j++) {
        const pointLabelVal = pointLabels[j];
        if (pointLabelVal >= unPositionedVal) {
          displayVal = pointLabelVal;
          cx = paddingRight + j * itemSpace;
          lastPosition = j;
          break;
        }
      }

      const displayText = yLabelRenderer(displayVal);
      const labelWidth = displayText.length * 4; // 4px per character
      // const labelWidth = 0;

      labels.push(
        <Text
          key={Math.random()}
          x={cx - labelWidth / 2}
          y={(height * 3) / 4 + paddingTop + fontSize * 2}
          fontSize={fontSize}
          fill={this.props.chartConfig.color(0.5)}
          textAnchor="middle"
        >
          {displayText}
        </Text>
      );
    }

    return labels;
  };

  renderVerticalLabelsAutomaticallyByDataPoint = config => {
    const {
      dataset,
      yLabelCount,
      yLabelRenderer,
      width,
      height,
      paddingRight,
      paddingTop,
    } = config;

    const fontSize = 12;
    const data = dataset.data;
    const pointLabels = dataset.labels;
    const dl = data.length;
    const itemSpace = (width - paddingRight) / dl;
    const color = this.props.chartConfig.color(0.5);
    const y = (height * 3) / 4 + paddingTop + fontSize * 2;

    /**
     * Get 6 top label only
     */
    let labels = [];
    const step = dl / yLabelCount;

    if (dl <= yLabelCount) {
      return pointLabels.map((pointLabel, pointIndex) => {
        const displayText = yLabelRenderer(pointLabel);
        // const labelWidth = displayText.length * 4; // 4px per character
        const labelWidth = 0; // Center
        const cx = paddingRight + pointIndex * itemSpace;

        return (
          <Text
            key={pointIndex}
            x={cx - labelWidth / 2}
            y={y}
            fontSize={fontSize}
            fill={color}
            textAnchor="middle"
          >
            {displayText}
          </Text>
        )
      })
    }

    /**
     * dl > yLabelCount
     */
    for (let lc = 1; lc <= yLabelCount; lc++) {
      const pointIndex = Math.floor(lc * step) - 1;
      const pointLabel = pointLabels[pointIndex];
      const displayText = yLabelRenderer(pointLabel);
      const labelWidth = displayText.length * 4; // 4px per character
      // const labelWidth = 0; // Center
      const cx = paddingRight + pointIndex * itemSpace;

      labels.push(
        <Text
          key={lc}
          x={cx - labelWidth / 2}
          y={y}
          fontSize={fontSize}
          fill={color}
          textAnchor="middle"
        >
          {displayText}
        </Text>
      );
    }

    return labels;
  };

  renderVerticalLines = config => {
    const {data, width, height, paddingTop, paddingRight} = config
    return [...new Array(data.length)].map((_, i) => {
      return (
        <Line
          key={Math.random()}
          x1={Math.floor(
            ((width - paddingRight) / data.length) * i + paddingRight
          )}
          y1={0}
          x2={Math.floor(
            ((width - paddingRight) / data.length) * i + paddingRight
          )}
          y2={height - height / 4 + paddingTop}
          stroke={this.props.chartConfig.color(0.2)}
          strokeDasharray="5, 10"
          strokeWidth={1}
        />
      )
    })
  }

  renderVerticalLine = config => {
    const {height, paddingTop, paddingRight} = config
    return (
      <Line
        key={Math.random()}
        x1={Math.floor(paddingRight)}
        y1={0}
        x2={Math.floor(paddingRight)}
        y2={height - height / 4 + paddingTop}
        stroke={this.props.chartConfig.color(0.2)}
        strokeDasharray="5, 10"
        strokeWidth={1}
      />
    )
  }

  renderDefs = config => {
    const {width, height, backgroundGradientFrom, backgroundGradientTo} = config
    return (
      <Defs>
        <LinearGradient
          id="backgroundGradient"
          x1="0"
          y1={height}
          x2={width}
          y2={0}
        >
          <Stop offset="0" stopColor={backgroundGradientFrom} />
          <Stop offset="1" stopColor={backgroundGradientTo} />
        </LinearGradient>
        <LinearGradient
          id="fillShadowGradient"
          x1={0}
          y1={0}
          x2={0}
          y2={height}
        >
          <Stop
            offset="0"
            stopColor={this.props.chartConfig.color()}
            stopOpacity="0.1"
          />
          <Stop
            offset="1"
            stopColor={this.props.chartConfig.color()}
            stopOpacity="0"
          />
        </LinearGradient>
      </Defs>
    )
  }

  renderTooltip({ value, dataset, getColor }) {
    return this.props.renderTooltip
      ? this.props.renderTooltip({ value, dataset, getColor })
      : null;
  }

  showDataPointTooltip({ index, value, cx, cy, dataset, getColor }) {
    this.cx = cx;
    this.cy = cy;

    // if (this.props.renderTooltip) {
    //   const tooltipEl = this.renderTooltip({ value, dataset, getColor, index });
    //
    //   // append tooltip to view
    //   //
    // }
  }

  hideAllTooltip() {
    this.setState({
      tooltipVisible: false,
    })
  }

  calCx(index) {
    // return index;
    return this.cx;
    // return this.cx + index;
  }

  calCy(value) {
    // return value;
    return this.cy;
    // return this.cy + value;
  }

  renderTooltipElement() {
    const {
            tooltipVisible,
            tooltipTextX,
            tooltipTextY,
            tooltipTargetIndex,
            tooltipTargetValue,
          } = this.state;
    const { height } = this.props;

    return (
      <TooltipDecorator
        visible={tooltipVisible}
        textX={tooltipTextX}
        textY={tooltipTextY}
        index={tooltipTargetIndex}
        value={tooltipTargetValue}
        x={(index) => this.calCx(index)} // x(index) => x tooltip
        y={(value) => this.calCy(value)} // y(value) => y value
        chartHeight={height}
        stroke={'#00ccff'}
        pointStroke={'#00ccff'}
      />
    )
  }
}

export default AbstractChart
