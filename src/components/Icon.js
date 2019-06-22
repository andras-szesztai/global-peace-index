import React from 'react'
import { Icon } from 'semantic-ui-react'

const ChartIcon = (props) => { return <div><Icon name={props.type} /><p>{props.text}</p></div>}

export {ChartIcon}