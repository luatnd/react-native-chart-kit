import PropTypes from 'prop-types'
import React from 'react'
import { Circle, G, Line, Rect, Text } from 'react-native-svg'
import { Dimensions } from "react-native";

const screenWidth = Dimensions.get('window').width;

const Tooltip = ({ visible, x, y, value, index, chartHeight, textX, textY, stroke, pointStroke }) => {

  // console.log('{Tooltip} visible, x, y, value, index, height, textX, textY, stroke, pointStroke: ', visible, x, y, value, index, height, textX, textY, stroke, pointStroke);
  let tipW = 136,
      tipH = 36,
      tipX = 5,
      tipY = -9,
      tipTxtX = 12,
      tipTxtY = 6
  ;

  const posY = y(value);
  const posX = x(index);
  // If overlap the right screen then translate to the left

  if (posX > screenWidth - tipW) {
    tipX = -(tipX + tipW);
    tipTxtX = tipTxtX - tipW - 6;
  }

  return (!visible ? null :
        <G>
            <Line
                x1={ posX }
                y1={ posY }
                x2={ posX }
                y2={ chartHeight - 25 }
                stroke={ stroke }
                strokeWidth={ 1 }
                fill={ stroke }
            />
            <Circle
                cx={ posX }
                cy={ posY }
                r={ 4 }
                stroke={ pointStroke }
                strokeWidth={ 2 }
                fill={ 'blue' }
            />
            <G
              x={ posX < 40 ? 40 : posX }
              y={ posY }
            >
                <Rect
                    x={ tipX + 1 }
                    y={ tipY - 1 }
                    width={ tipW - 2 }
                    height={ tipH - 2 }
                    fill={ 'rgba(255, 255, 255, 0.9)' }
                    rx={ 2 }
                    ry={ 2 }
                />
                <Rect
                    x={ tipX }
                    y={ tipY }
                    width={ tipW }
                    height={ tipH }
                    rx={ 2 }
                    ry={ 2 }
                    fill={ 'transparent' }
                    stroke={ stroke }
                />
                <Text
                  x={tipTxtX}
                  y={tipTxtY}
                  fontSize="10"
                  textAnchor="start"
                >{textX}</Text>

                <Text
                  x={tipTxtX}
                  y={tipTxtY + 14}
                  fontSize="12"
                  textAnchor="start"
                >{textY}</Text>
            </G>
        </G>
    )
}

Tooltip.propTypes = {
    x: PropTypes.func.isRequired,
    y: PropTypes.func.isRequired,
    value: PropTypes.number,
    index: PropTypes.number,
    height: PropTypes.number,
    stroke: PropTypes.string,
    pointStroke: PropTypes.string,
    textX: PropTypes.string,
    textY: PropTypes.string,
}

export default Tooltip
