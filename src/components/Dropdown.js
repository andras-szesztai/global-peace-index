import beeSwarmData from '../data/beeswarmData.json'
import React from 'react';
import { Dropdown } from 'semantic-ui-react'
import _ from 'lodash'

const metricOptions = [{ key: 1, text: 'Choice 1', value: 1 }, { key: 2, text: 'Choice 2', value: 2 }]

const countryList = _.uniq(beeSwarmData.map(d => d.country))
const options = countryList.map(e =>{
     return { key: e.toLowerCase(), text: e, value: e.toLowerCase()}
})

const MultipleDropdown = (props) => (
  <Dropdown
    placeholder='Countries'
    fluid
    multiple
    selection
    options={options}
    value={props.values}
    onChange={props.onChange}
    />
)

const SingleDropDown = (props) => (
  <Dropdown
    text=' '
    options={metricOptions} />
)

export { MultipleDropdown, SingleDropDown }
