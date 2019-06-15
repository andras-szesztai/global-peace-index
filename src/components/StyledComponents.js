import styled from 'styled-components'

const Wrapper = styled.div`

    position: relative

    background-color: ${props => props.background || '#fff'};

    grid-row: ${props => props.gridRow};
    grid-column: ${props => props.gridColumn};

    padding: ${props => props.padding || 0}

`

const ChartContainer = styled.div`

    position: relative

    background-color: ${props => props.background || '#fff'};

`

export { Wrapper, ChartContainer }
