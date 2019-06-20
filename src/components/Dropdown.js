import beeSwarmData from '../data/beeswarmData.json'
import React from 'react';
import { Dropdown } from 'semantic-ui-react'
import _ from 'lodash'


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
    open={props.open}
    options={props.options}
    scrolling={true}
    onChange={props.onChange}
    onBlur={props.onBlur}
    selectOnBlur={false}
    onClick={props.onClick} />
)

export { MultipleDropdown, SingleDropDown }
