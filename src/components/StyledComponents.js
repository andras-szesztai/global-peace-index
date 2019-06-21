import styled from 'styled-components'

const Wrapper = styled.div`

    font-family: gill-sans-nova-condensed, sans-serif;
    font-style: normal;
    font-weight: 300;
    font-size: 1.2rem;

    background-color: ${props => props.background || '#fff'};

    grid-row: ${props => props.gridRow};
    grid-column: ${props => props.gridColumn};

    padding: ${props => props.padding || 0}

`

const SmallTooltip = styled.div`
    position: absolute;
    display: none;
    color: ${props => props.color};
    z-index: 20;

    border-radius: 3px;
    padding: .6rem 1rem;

    background: #fff;

    text-align: center;
    white-space: nowrap;
    pointer-events: none;

    border-style: solid;
    border-width: 1px;
    border-color: ${props => props.color};

    &:after {
      top: 100%;
    	left: 50%;
    	border: solid transparent;
    	content: " ";
    	height: 0;
    	width: 0;
    	position: absolute;
    	pointer-events: none;
    	border-color: rgba(136, 183, 213, 0);
    	border-top-color: ${props => props.color}
    	border-width: 8px;
    	margin-left: -8px;
    }

    p,
    h4 {
      font-size: .8em;
      line-height: .4;
      margin-bottom: .8rem !important;
      padding: 0 !important;
    }

    .score {
      font-size: 1.6rem;
      font-weight: 700;
    }

`

const Tooltip = styled.div`

    position: absolute;
    display: none;
    background: #fff;
    opacity: 1;
    z-index: 20;

    border-radius: 5px;
    white-space: nowrap;
    pointer-events: none;

    border-style: solid;
    border-width: 1px;
    border-color: ${props => props.color};

    text-align: center;

    &:after {

      right: ${props => props.left ? '' : '100%'};
      left:  ${props => props.left ? '100%' : ''};
      top: 12%;
      border: solid transparent;
      content: " ";
      height: 0;
      width: 0;
      position: absolute;
      pointer-events: none;
      border-color: rgba(136, 183, 213, 0);
      border-right-color: ${props => props.left ? '' : props.color};
      border-left-color: ${props => props.left ? props.color : ''};
      border-width: 15px;
      margin-top: -15px;
      }


    h4 {
      padding-top: 1rem;
      color: #333;
    }

    span {
      font-weight: 700;
    }

    h4,
    p {
      line-height: .3;
    }


`

const ChartContainer = styled.div`

    circle,
    line {
      cursor: pointer;
    }

    text {
      font-family: gill-sans-nova-condensed, sans-serif;
      font-style: normal;
      font-weight: 300;
      font-size: 1.2rem;
    }

    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;


    background-color: ${props => props.background || '#fff'};

    .domain{
      stroke: rgba(34,36,38,.15);
    }

    .label-text {
      fill: #333333;
    }

    /* .label-text-middle {
      font-weight: 400;
    } */

    .year-text {
      font-size: 3rem;
      font-weight: 200;
    }
`

const secondaryColor = '#666666'
export { Wrapper, ChartContainer, Tooltip, SmallTooltip, secondaryColor }
